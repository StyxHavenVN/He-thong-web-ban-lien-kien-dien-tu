const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Vui lòng đăng nhập.' });
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'do-an-c4-secret-key');
    const user = await userRepository.findById(payload.id);
    if (!user || user.status === 'LOCKED') return res.status(401).json({ message: 'Tài khoản không hợp lệ hoặc đã bị khóa.' });
    req.user = user;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' });
  }
}

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Vui lòng đăng nhập.' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Bạn không có quyền truy cập.' });
    return next();
  };
}

module.exports = { requireAuth, allowRoles };
