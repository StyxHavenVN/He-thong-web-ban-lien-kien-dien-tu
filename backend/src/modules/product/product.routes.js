const express = require('express');
const router = express.Router();
const productController = require('./product.controller');

router.get('/', productController.getProducts);
router.get('/categories', productController.getCategories);
router.get('/:id/compatibility', productController.getCompatibility);
router.get('/:id', productController.getProduct);

module.exports = router;
