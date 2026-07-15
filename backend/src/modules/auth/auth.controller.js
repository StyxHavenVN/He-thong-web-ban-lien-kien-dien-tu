const authService = require('./auth.service');

async function register(req, res) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, message: result.message, data: result.user });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function login(req, res) {
  try {
    const result = await authService.login(req.body);
    res.json({ success: true, message: result.message, token: result.token, data: result.user });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

function me(req, res) {
  res.json({ success: true, data: authService.publicUser(req.user) });
}

module.exports = { register, login, me };
