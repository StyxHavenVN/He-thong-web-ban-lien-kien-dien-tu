const express = require('express');
const controller = require('./admin.controller');
const { requireAuth, allowRoles } = require('../../middleware/authMiddleware');
const router = express.Router();
router.use(requireAuth, allowRoles('ADMIN'));
router.get('/customers', controller.customers);
router.patch('/customers/:id/lock', controller.toggleCustomerLock);
router.get('/reports/revenue', controller.report);
module.exports = router;
