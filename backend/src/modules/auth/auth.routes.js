const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');

// Đăng ký - POST /api/auth/register
router.post('/register', authController.register);

// Đăng nhập - POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;