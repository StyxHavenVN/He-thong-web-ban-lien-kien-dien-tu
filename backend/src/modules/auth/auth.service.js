const { v4: uuid } = require('uuid');
const { readDb, writeDb } = require('../../repositories/jsonRepository');
const { sign, hashPassword } = require('../../utils/authToken');

function publicUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

function register({ fullName, email, phone, address, password }) {
  if (!fullName || !email || !password) throw new Error('Vui lòng nhập đầy đủ họ tên, email và mật khẩu.');
  const db = readDb();
  const existed = db.users.some(u => u.email.toLowerCase() === email.toLowerCase());
  if (existed) throw new Error('Email đã được sử dụng.');

  const user = {
    id: uuid(), fullName, email, phone: phone || '', address: address || '',
    role: 'CUSTOMER', passwordHash: hashPassword(password), locked: false
  };
  db.users.push(user);
  writeDb(db);
  const token = sign({ userId: user.id, role: user.role, iat: Date.now() });
  return { token, user: publicUser(user) };
}

function login({ email, password }) {
  const db = readDb();
  const user = db.users.find(u => u.email.toLowerCase() === String(email || '').toLowerCase());
  if (!user || user.passwordHash !== hashPassword(password || '')) throw new Error('Email hoặc mật khẩu không đúng.');
  if (user.locked) throw new Error('Tài khoản đã bị khóa.');
  const token = sign({ userId: user.id, role: user.role, iat: Date.now() });
  return { token, user: publicUser(user) };
}

module.exports = { register, login, publicUser };
