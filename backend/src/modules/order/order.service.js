const { v4: uuid } = require('uuid');
const { readDb, writeDb } = require('../../repositories/jsonRepository');
const cartService = require('../cart/cart.service');
const paymentService = require('../payment/payment.service');
const shippingService = require('../shipping/shipping.service');
const notificationService = require('../notification/notification.service');

function createOrder(user, payload) {
  const db = readDb();
  const cart = cartService.getCart(user.id);
  if (!cart.items.length) throw new Error('Giỏ hàng đang trống.');

  for (const item of cart.items) {
    const product = db.products.find(p => p.id === item.productId);
    if (!product || product.stock < item.quantity) throw new Error(`Sản phẩm ${item.product?.name || item.productId} không đủ tồn kho.`);
  }

  const shippingAddress = payload.shippingAddress || user.address;
  const customerName = String(payload.customerName || user.fullName || '').trim();
  const customerPhone = String(payload.customerPhone || user.phone || '').trim();
  const normalizedAddress = String(shippingAddress || '').trim();
  if (!customerName || !customerPhone || !normalizedAddress) {
    throw new Error('Vui lòng nhập đầy đủ họ tên, số điện thoại và địa chỉ giao hàng.');
  }
  if (!/^(0|\+84)\d{9}$/.test(customerPhone.replace(/[\s.-]/g, ''))) throw new Error('Số điện thoại giao hàng không hợp lệ.');
  const paymentMethod = payload.paymentMethod || 'COD';
  if (!['COD', 'ONLINE'].includes(paymentMethod)) throw new Error('Phương thức thanh toán không hợp lệ.');

  const order = {
    id: uuid(), customerId: user.id,
    items: cart.items.map(item => ({
      productId: item.productId,
      productName: item.product.name,
      quantity: item.quantity,
      unitPrice: item.product.price
    })),
    totalAmount: cart.total,
    customerName,
    customerPhone,
    paymentMethod,
    paymentStatus: 'UNPAID',
    shippingAddress: normalizedAddress,
    shippingStatus: 'PENDING',
    status: paymentMethod === 'ONLINE' ? 'WAITING_PAYMENT' : 'WAITING_CONFIRM',
    createdAt: new Date().toISOString()
  };

  for (const item of cart.items) {
    const product = db.products.find(p => p.id === item.productId);
    product.stock -= item.quantity;
  }

  db.orders.push(order);
  paymentService.processPayment(db, order, order.paymentMethod);
  if (order.paymentStatus === 'PAID') order.status = 'WAITING_CONFIRM';
  shippingService.createShipment(db, order);
  notificationService.send(db, user, 'ORDER_CREATED', `Đơn hàng ${order.id} đã được tạo thành công.`);
  cartService.clearCart(user.id, db);

  writeDb(db);
  return order;
}

function listMyOrders(userId) {
  const db = readDb();
  return db.orders.filter(o => o.customerId === userId).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
}

function listAllOrders() {
  const db = readDb();
  return db.orders.map(order => ({ ...order, customer: db.users.find(u => u.id === order.customerId) }));
}

function updateStatus(orderId, status) {
  const db = readDb();
  const order = db.orders.find(o => o.id === orderId);
  if (!order) throw new Error('Không tìm thấy đơn hàng.');
  if (order.status === 'CANCELLED' && ['SHIPPING','COMPLETED'].includes(status)) {
    throw new Error('Đơn hàng đã hủy không thể chuyển sang trạng thái giao hàng hoặc hoàn thành.');
  }
  order.status = status;
  order.updatedAt = new Date().toISOString();
  const user = db.users.find(u => u.id === order.customerId);
  if (user) notificationService.send(db, user, 'ORDER_STATUS', `Đơn hàng ${order.id} được cập nhật sang trạng thái ${status}.`);
  writeDb(db);
  return order;
}

function getOrder(user, orderId) {
  const db = readDb();
  const order = db.orders.find(o => o.id === orderId);
  if (!order) throw new Error('Không tìm thấy đơn hàng.');
  if (user.role === 'CUSTOMER' && order.customerId !== user.id) throw new Error('Bạn không có quyền xem đơn hàng này.');
  return order;
}

module.exports = { createOrder, listMyOrders, listAllOrders, updateStatus, getOrder };
