const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'do-an-c4-secret-key';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

function sign(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

function verify(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (error) {
    return null;
  }
}

// Giữ lại tương thích ngược nếu cần
const crypto = require('crypto');
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

module.exports = { sign, verify, hashPassword };
