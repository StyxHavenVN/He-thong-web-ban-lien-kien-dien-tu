const orderService = require('./order.service');

async function respond(res, callback, status = 200) {
  try {
    res.status(status).json(await callback());
  } catch (error) {
    res.status(error.statusCode || 400).json({ message: error.message });
  }
}

const create = (req, res) => respond(res, () => orderService.createOrder(req.user, req.body), 201);
const my = (req, res) => respond(res, () => orderService.listMyOrders(req.user.id));
const all = (_req, res) => respond(res, () => orderService.listAllOrders());
const detail = (req, res) => respond(res, () => orderService.getOrder(req.user, req.params.id));
const updateStatus = (req, res) => respond(res, () => orderService.updateStatus(req.user, req.params.id, req.body.status));

module.exports = { create, my, all, detail, updateStatus };
