const request = require('supertest');
const app = require('../src/app');
const sequelize = require('../src/data/config/database');

describe('App 404 Handler', () => {
  afterAll(async () => {
    await sequelize.close();
  });

  it('should return 404 and error message for non-existent route', async () => {
    const res = await request(app)
      .get('/api/some-non-existent-route')
      .expect(404);

    expect(res.body).toHaveProperty('message', 'Không tìm thấy trang yêu cầu.');
  });
});
