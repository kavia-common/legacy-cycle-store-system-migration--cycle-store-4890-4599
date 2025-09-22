'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Category', [
      { name: 'Bikes', description: 'All kinds of bicycles' },
      { name: 'Accessories', description: 'Helmets, locks, lights' },
      { name: 'Apparel', description: 'Clothing and wearables' }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Category', null, {});
  }
};
