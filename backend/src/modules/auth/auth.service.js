const { v4: uuid } = require('uuid');
const { readDb, writeDb } = require('../../repositories/jsonRepository');
const { sign, hashPassword } = require('../../utils/authToken');

function publicUser(user) {
  const { passwordHash, loginAttempts, lockedUntil, ...safe } = user;
  return safe;
}

function register({ fullName, email, phone, address, password }) {
  const normalized = {
    fullName: String(fullName || '').trim(),
    email: String(email || '').trim().toLowerCase(),
    phone: String(phone || '').trim(),
    address: String(address || '').trim(),
    password: String(password || '')
  };
  if (!normalized.fullName || !normalized.email || !normalized.phone || !normalized.address || !normalized.password) {
    throw new Error('Vui lòng nhập đầy đủ họ tên, email, số điện thoại, địa chỉ và mật khẩu.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email)) throw new Error('Email không hợp lệ.');
  if (!/^(0|\+84)\d{9}$/.test(normalized.phone.replace(/[\s.-]/g, ''))) throw new Error('Số điện thoại không hợp lệ.');
  if (normalized.password.length < 6) throw new Error('Mật khẩu phải có ít nhất 6 ký tự.');
  const db = readDb();
  const existed = db.users.some(u => u.email.toLowerCase() === normalized.email);
  if (existed) throw new Error('Email đã được sử dụng.');

  const user = {
    id: uuid(), fullName: normalized.fullName, email: normalized.email,
    phone: normalized.phone, address: normalized.address,
    role: 'CUSTOMER', passwordHash: hashPassword(normalized.password), locked: false
  };
  db.users.push(user);
  writeDb(db);
  const token = sign({ userId: user.id, role: user.role, iat: Date.now() });
  return { token, user: publicUser(user) };
}

function login({ email, password }) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail || !password) throw new Error('Vui lòng nhập đầy đủ email và mật khẩu.');
  const db = readDb();
  const user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (!user || user.passwordHash !== hashPassword(password)) throw new Error('Email hoặc mật khẩu không đúng.');
  if (user.locked) throw new Error('Tài khoản đã bị khóa và không thể đăng nhập.');
  const token = sign({ userId: user.id, role: user.role, iat: Date.now() });
  return { token, user: publicUser(user) };
}

module.exports = { register, login, publicUser };
