const { verify } = require('../utils/authToken');
const User = require('../modules/auth/user.model');

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Vui lòng đăng nhập.' });

    const payload = verify(token);
    if (!payload || !payload.id) return res.status(401).json({ message: 'Vui lòng đăng nhập.' });

    // Truy vấn thông tin người dùng từ PostgreSQL
    const user = await User.findByPk(payload.id);
    if (!user || user.status === 'LOCKED') {
      return res.status(401).json({ message: 'Tài khoản không hợp lệ hoặc bị khóa.' });
    }

    req.user = user.toJSON();
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Vui lòng đăng nhập.' });
  }
}

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Vui lòng đăng nhập.' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Bạn không có quyền truy cập.' });
    next();
  };
}

module.exports = { requireAuth, allowRoles };
