'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('products', ['name']);
    await queryInterface.addIndex('products', ['categoryId']);
    await queryInterface.addIndex('products', ['brand']);
    await queryInterface.addIndex('products', ['price']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('products', ['name']);
    await queryInterface.removeIndex('products', ['categoryId']);
    await queryInterface.removeIndex('products', ['brand']);
    await queryInterface.removeIndex('products', ['price']);
  }
};
