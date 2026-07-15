const cartRepository = require('../../repositories/cart.repository');
const orderRepository = require('../../repositories/order.repository');
const productRepository = require('../../repositories/product.repository');
const paymentService = require('../payment/payment.service');
const shippingService = require('../shipping/shipping.service');
const notificationService = require('../notification/notification.service');

const allowedStatuses = ['WAITING_CONFIRM', 'PAID', 'PROCESSING', 'SHIPPING', 'COMPLETED', 'CANCELLED', 'PAYMENT_FAILED'];

async function createOrder(user, payload = {}) {
  const shippingAddress = String(payload.shippingAddress || user.address || '').trim();
  if (!shippingAddress) throw new Error('Vui lòng nhập địa chỉ giao hàng.');
  const paymentMethod = ['ONLINE', 'ONLINE_FAIL'].includes(payload.paymentMethod) ? 'ONLINE' : 'COD';
  const paymentFailed = payload.paymentMethod === 'ONLINE_FAIL';

  const orderId = await orderRepository.withTransaction(async (transaction) => {
    const cartRows = await cartRepository.listByUser(user.id, { transaction });
    if (!cartRows.length) throw new Error('Giỏ hàng đang trống.');

    const items = [];
    let subtotal = 0;
    for (const cartItem of cartRows) {
      const product = paymentFailed
        ? await productRepository.findForUpdate(cartItem.productId, transaction)
        : await productRepository.decrementStock(cartItem.productId, cartItem.quantity, transaction);
      if (!product || !product.active || product.stock < (paymentFailed ? cartItem.quantity : 0)) throw new Error(`${cartItem.product?.name || 'Sản phẩm'} không đủ tồn kho.`);
      subtotal += product.price * cartItem.quantity;
      items.push({ productId: product.id, productName: product.name, quantity: cartItem.quantity, unitPrice: product.price });
    }

    const shippingFee = shippingService.calculateFee(shippingAddress, subtotal, payload.deliveryMethod);
    const online = paymentMethod === 'ONLINE';
    const order = await orderRepository.create({
      customerId: user.id,
      subtotal,
      shippingFee,
      totalAmount: subtotal + shippingFee,
      paymentMethod,
      paymentStatus: online ? (paymentFailed ? 'FAILED' : 'PAID') : 'UNPAID',
      shippingAddress,
      shippingStatus: paymentFailed ? 'NOT_CREATED' : 'READY',
      status: online ? (paymentFailed ? 'PAYMENT_FAILED' : 'PAID') : 'WAITING_CONFIRM'
    }, { transaction });

    await orderRepository.createItems(items.map((item) => ({ ...item, orderId: order.id })), { transaction });
    await orderRepository.createPayment(paymentService.createPayment(order, paymentMethod, paymentFailed), { transaction });
    if (!paymentFailed) {
      const shipment = shippingService.createShipment(order, shippingFee);
      await orderRepository.createShipment(shipment, { transaction });
      await order.update({ trackingCode: shipment.trackingCode }, { transaction });
    }
    await orderRepository.createNotification(
      notificationService.createNotification(
        user,
        paymentFailed ? 'PAYMENT_FAILED' : 'ORDER_CREATED',
        paymentFailed ? `Thanh toán đơn hàng ${order.id} thất bại. Giỏ hàng của bạn được giữ nguyên.` : `Đơn hàng ${order.id} đã được tạo thành công.`
      ),
      { transaction }
    );
    if (!paymentFailed) await cartRepository.clear(user.id, { transaction });
    return order.id;
  });

  return orderRepository.findById(orderId);
}

const listMyOrders = (userId) => orderRepository.listByCustomer(userId);
const listAllOrders = () => orderRepository.listAll();

async function getOrder(user, orderId) {
  const order = await orderRepository.findById(orderId);
  if (!order) throw Object.assign(new Error('Không tìm thấy đơn hàng.'), { statusCode: 404 });
  if (user.role === 'CUSTOMER' && order.customerId !== user.id) throw Object.assign(new Error('Bạn không có quyền xem đơn hàng này.'), { statusCode: 403 });
  return order;
}

async function updateStatus(user, orderId, status) {
  if (!allowedStatuses.includes(status)) throw new Error('Trạng thái đơn hàng không hợp lệ.');
  const current = await orderRepository.findById(orderId);
  if (!current) throw Object.assign(new Error('Không tìm thấy đơn hàng.'), { statusCode: 404 });
  if (current.status === 'CANCELLED' && ['SHIPPING', 'COMPLETED'].includes(status)) throw new Error('Đơn đã hủy không thể chuyển sang giao hàng hoặc hoàn thành.');
  const shippingStatus = status === 'SHIPPING' ? 'IN_TRANSIT'
    : status === 'COMPLETED' ? 'DELIVERED'
      : status === 'CANCELLED' ? 'CANCELLED' : 'READY';
  const order = await orderRepository.updateStatus(orderId, { status, shippingStatus });
  await orderRepository.createNotification(notificationService.createNotification(
    order.customer,
    'ORDER_STATUS',
    `Đơn hàng ${order.id} đã cập nhật sang ${status}.`
  ));
  return order;
}

module.exports = { createOrder, listMyOrders, listAllOrders, updateStatus, getOrder };
