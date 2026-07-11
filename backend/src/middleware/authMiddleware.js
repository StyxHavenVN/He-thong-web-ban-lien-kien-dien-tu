const { verify } = require('../utils/authToken');
const { readDb } = require('../repositories/jsonRepository');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const payload = verify(token);
  if (!payload) return res.status(401).json({ message: 'Vui lòng đăng nhập.' });

  const db = readDb();
  const user = db.users.find(u => u.id === payload.userId && !u.locked);
  if (!user) return res.status(401).json({ message: 'Tài khoản không hợp lệ hoặc bị khóa.' });

  req.user = user;
  next();
}

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Vui lòng đăng nhập.' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Bạn không có quyền truy cập.' });
    next();
  };
}

module.exports = { requireAuth, allowRoles };
