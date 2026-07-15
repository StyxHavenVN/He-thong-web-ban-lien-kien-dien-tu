const express = require('express');
const controller = require('./admin.controller');
const { requireAuth, allowRoles } = require('../../middleware/authMiddleware');

const router = express.Router();
router.use(requireAuth, allowRoles('ADMIN'));
router.get('/customers', controller.customers);
router.patch('/customers/:id/lock', controller.toggleCustomerLock);
router.get('/reports/revenue', controller.report);
router.get('/products', controller.products);
router.post('/products', controller.createProduct);
router.put('/products/:id', controller.updateProduct);
router.delete('/products/:id', controller.deleteProduct);
router.get('/categories', controller.categories);
router.post('/categories', controller.createCategory);
router.put('/categories/:id', controller.updateCategory);
router.delete('/categories/:id', controller.deleteCategory);

module.exports = router;
