'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const defaultPassword = await bcrypt.hash('123456', 10);
    await queryInterface.bulkInsert('users', [
      {
        id: '11111111-1111-1111-1111-111111111111',
        fullname: 'Quản trị viên',
        email: 'admin@shop.local',
        phone: '0900000001',
        password: defaultPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        failedLoginAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        fullname: 'Nhân viên kho',
        email: 'staff@shop.local',
        phone: '0900000002',
        password: defaultPassword,
        role: 'STAFF',
        status: 'ACTIVE',
        failedLoginAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        fullname: 'Khách hàng mẫu',
        email: 'customer@shop.local',
        phone: '0900000003',
        password: defaultPassword,
        role: 'CUSTOMER',
        status: 'ACTIVE',
        failedLoginAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
