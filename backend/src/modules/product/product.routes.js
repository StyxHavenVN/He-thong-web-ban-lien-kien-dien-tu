const express = require('express');
const router = express.Router();
const productController = require('./product.controller');

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductDetail);

module.exports = router;