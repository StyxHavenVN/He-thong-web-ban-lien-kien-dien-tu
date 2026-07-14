const request = require('supertest');
const app = require('../src/app');
const sequelize = require('../src/data/config/database');

describe('GET /health', () => {
  // Đóng kết nối CSDL sau khi tất cả các test case chạy xong để tránh rò rỉ bộ nhớ/Jest bị treo
  afterAll(async () => {
    await sequelize.close();
  });

  it('should return 200 and system status OK', async () => {
    const res = await request(app)
      .get('/health')
      .expect(200);

    expect(res.body).toHaveProperty('status', 'OK');
    expect(res.body).toHaveProperty('database', 'connected');
    expect(res.body).toHaveProperty('timestamp');
  });
});
