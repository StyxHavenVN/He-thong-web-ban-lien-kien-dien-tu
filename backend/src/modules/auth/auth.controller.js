const authService = require('./auth.service');

function register(req, res) {
  try { res.status(201).json(authService.register(req.body)); }
  catch (err) { res.status(400).json({ message: err.message }); }
}
function login(req, res) {
  try { res.json(authService.login(req.body)); }
  catch (err) { res.status(400).json({ message: err.message }); }
}
function me(req, res) { res.json({ user: authService.publicUser(req.user) }); }

module.exports = { register, login, me };
