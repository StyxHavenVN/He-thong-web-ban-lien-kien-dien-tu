const request = require('supertest');
const app = require('../src/app');
const sequelize = require('../src/data/config/database');
const User = require('../src/modules/auth/user.model');

describe('Auth & RBAC Integration Tests', () => {
  beforeEach(async () => {
    // Dọn dẹp dữ liệu người dùng trước mỗi test case để tránh ảnh hưởng chéo
    await User.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a CUSTOMER successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullname: 'Nguyễn Văn A',
          email: 'customer-test@gmail.com',
          phone: '0901234567',
          password: 'password123',
          address: 'Hà Nội'
        })
        .expect(201);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('role', 'CUSTOMER');
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should return 409 for duplicate email', async () => {
      // Đăng ký user đầu tiên
      await User.create({
        fullname: 'Người dùng 1',
        email: 'duplicate-test@gmail.com',
        phone: '0901111111',
        password: 'password123',
        role: 'CUSTOMER'
      });

      // Đăng ký trùng email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullname: 'Người dùng 2',
          email: 'duplicate-test@gmail.com',
          phone: '0902222222',
          password: 'password123'
        })
        .expect(409);

      expect(res.body.message).toContain('Email này đã được sử dụng');
    });

    it('should return 409 for duplicate phone number', async () => {
      // Đăng ký user đầu tiên
      await User.create({
        fullname: 'Người dùng 1',
        email: 'user1@gmail.com',
        phone: '0909999999',
        password: 'password123',
        role: 'CUSTOMER'
      });

      // Đăng ký trùng phone
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullname: 'Người dùng 2',
          email: 'user2@gmail.com',
          phone: '0909999999',
          password: 'password123'
        })
        .expect(409);

      expect(res.body.message).toContain('Số điện thoại này đã được sử dụng');
    });

    it('should return 400 for password length < 6', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullname: 'Nguyễn Văn A',
          email: 'customer-test@gmail.com',
          phone: '0901234567',
          password: '123'
        })
        .expect(400);

      expect(res.body.message).toContain('Mật khẩu phải có ít nhất 6 ký tự');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should log in successfully with correct credentials', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          fullname: 'Khách Hàng',
          email: 'login-test@gmail.com',
          phone: '0912345678',
          password: 'password123'
        })
        .expect(201);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login-test@gmail.com',
          password: 'password123'
        })
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('token');
      expect(res.body.data).toHaveProperty('role', 'CUSTOMER');
    });

    it('should lock account after 5 failed login attempts', async () => {
      // 1. Tạo user
      await request(app)
        .post('/api/auth/register')
        .send({
          fullname: 'Khách Hàng Thử Khóa',
          email: 'lock-test@gmail.com',
          phone: '0987654321',
          password: 'password123'
        })
        .expect(201);

      // 2. Đăng nhập sai 5 lần liên tiếp
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            email: 'lock-test@gmail.com',
            password: 'wrongpassword'
          })
          .expect(401);
      }

      // 3. Lần đăng nhập thứ 6 phải trả về 423
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'lock-test@gmail.com',
          password: 'password123'
        })
        .expect(423);

      expect(res.body.message).toContain('khóa tạm thời');
    });
  });

  describe('RBAC Middleware Protection', () => {
    it('should return 401 when accessing admin API without token', async () => {
      const res = await request(app)
        .get('/api/admin/customers')
        .expect(401);

      expect(res.body.message).toContain('đăng nhập');
    });

    it('should return 403 when CUSTOMER user attempts to call ADMIN API', async () => {
      // 1. Đăng ký và đăng nhập với vai trò CUSTOMER
      await request(app)
        .post('/api/auth/register')
        .send({
          fullname: 'Khách Thường',
          email: 'customer-rbac@gmail.com',
          phone: '0999999999',
          password: 'password123'
        })
        .expect(201);

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'customer-rbac@gmail.com',
          password: 'password123'
        })
        .expect(200);

      const token = loginRes.body.token;

      // 2. Gọi API admin bằng token của Customer
      const res = await request(app)
        .get('/api/admin/customers')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(res.body.message).toContain('không có quyền truy cập');
    });
  });
});
