const express = require('express');
const controller = require('./cart.controller');
const { requireAuth, allowRoles } = require('../../middleware/authMiddleware');
const router = express.Router();
router.use(requireAuth, allowRoles('CUSTOMER'));
router.get('/', controller.getCart);
router.post('/items', controller.addItem);
router.put('/items/:productId', controller.updateItem);
module.exports = router;
