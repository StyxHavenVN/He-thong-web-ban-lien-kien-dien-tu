'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('categories', [
      { id: 'cat-cpu', name: 'CPU - Bộ vi xử lý', createdAt: new Date(), updatedAt: new Date() },
      { id: 'cat-vga', name: 'VGA - Card màn hình', createdAt: new Date(), updatedAt: new Date() },
      { id: 'cat-mainboard', name: 'Mainboard - Bo mạch chủ', createdAt: new Date(), updatedAt: new Date() },
      { id: 'cat-ram', name: 'RAM - Bộ nhớ', createdAt: new Date(), updatedAt: new Date() },
      { id: 'cat-ssd', name: 'Ổ cứng - SSD', createdAt: new Date(), updatedAt: new Date() },
      { id: 'cat-psu', name: 'Nguồn - PSU', createdAt: new Date(), updatedAt: new Date() },
      { id: 'cat-case', name: 'Vỏ case', createdAt: new Date(), updatedAt: new Date() },
      { id: 'cat-cooler', name: 'Tản nhiệt', createdAt: new Date(), updatedAt: new Date() },
      { id: 'cat-laptop', name: 'Laptop', createdAt: new Date(), updatedAt: new Date() },
      { id: 'cat-laptop-gaming', name: 'Laptop Gaming', createdAt: new Date(), updatedAt: new Date() },
      { id: 'cat-pc-full', name: 'PC - Máy tính bộ', createdAt: new Date(), updatedAt: new Date() },
      { id: 'cat-monitor', name: 'Màn hình', createdAt: new Date(), updatedAt: new Date() },
      { id: 'cat-audio', name: 'Âm thanh - Tai nghe', createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categories', null, {});
  }
};
