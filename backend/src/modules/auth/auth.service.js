const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../../repositories/user.repository');

function httpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function publicUser(user) {
  const value = typeof user?.toJSON === 'function' ? user.toJSON() : user;
  if (!value) return null;
  return {
    id: value.id,
    fullName: value.fullname,
    email: value.email,
    phone: value.phone,
    address: value.address || '',
    role: value.role,
    status: value.status,
    locked: value.status === 'LOCKED'
  };
}

async function register(userData = {}) {
  const fullname = String(userData.fullname || userData.fullName || '').trim();
  const email = String(userData.email || '').trim().toLowerCase();
  const phone = String(userData.phone || '').trim();
  const password = String(userData.password || '');
  const address = String(userData.address || '').trim();

  if (!fullname || !email || !phone || !password) throw httpError('Vui lòng nhập đầy đủ thông tin bắt buộc.');
  if (!/^\S+@\S+\.\S+$/.test(email)) throw httpError('Email chưa đúng định dạng.');
  if (password.length < 6) throw httpError('Mật khẩu phải có ít nhất 6 ký tự.');
  if (await userRepository.findByEmailOrPhone(email, phone)) throw httpError('Email hoặc số điện thoại đã được sử dụng.', 409);

  const user = await userRepository.create({
    fullname,
    email,
    phone,
    address,
    password: await bcrypt.hash(password, 10),
    role: 'CUSTOMER',
    status: 'ACTIVE'
  });
  return { message: 'Đăng ký thành công!', user: publicUser(user) };
}

async function login(credentials = {}) {
  const email = String(credentials.email || '').trim().toLowerCase();
  const password = String(credentials.password || '');
  if (!email || !password) throw httpError('Vui lòng nhập đầy đủ email và mật khẩu.');

  const user = await userRepository.findByEmail(email);
  if (!user) throw httpError('Email hoặc mật khẩu không chính xác.', 401);

  if (user.status === 'LOCKED') {
    if (!user.lockUntil || new Date(user.lockUntil) > new Date()) throw httpError('Tài khoản đang bị khóa.', 403);
    await user.update({ status: 'ACTIVE', failedLoginAttempts: 0, lockUntil: null });
  }

  if (!(await bcrypt.compare(password, user.password))) {
    const failedLoginAttempts = Number(user.failedLoginAttempts || 0) + 1;
    const lock = failedLoginAttempts >= 5;
    await user.update({
      failedLoginAttempts,
      status: lock ? 'LOCKED' : user.status,
      lockUntil: lock ? new Date(Date.now() + 15 * 60 * 1000) : null
    });
    throw httpError(lock ? 'Sai mật khẩu 5 lần. Tài khoản tạm khóa 15 phút.' : 'Email hoặc mật khẩu không chính xác.', 401);
  }

  await user.update({ failedLoginAttempts: 0, lockUntil: null });
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || 'do-an-c4-secret-key',
    { expiresIn: '1h' }
  );
  return { message: 'Đăng nhập thành công!', token, user: publicUser(user) };
}

module.exports = { register, login, publicUser };
