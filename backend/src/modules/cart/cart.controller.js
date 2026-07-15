const cartService = require('./cart.service');

async function respond(res, callback, status = 200) {
  try {
    res.status(status).json(await callback());
  } catch (error) {
    res.status(error.statusCode || 400).json({ message: error.message });
  }
}

const getCart = (req, res) => respond(res, () => cartService.getCart(req.user.id));
const addItem = (req, res) => respond(res, () => cartService.addItem(req.user.id, req.body.productId, req.body.quantity), 201);
const updateItem = (req, res) => respond(res, () => cartService.updateItem(req.user.id, req.params.productId, req.body.quantity));
const removeItem = (req, res) => respond(res, () => cartService.removeItem(req.user.id, req.params.productId));

module.exports = { getCart, addItem, updateItem, removeItem };
