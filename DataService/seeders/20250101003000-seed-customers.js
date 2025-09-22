'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Customer', [
      { first_name: 'Jane', last_name: 'Doe', email: 'jane.doe@example.com', phone: '555-111-2222', created_at: new Date() }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Customer', null, {});
  }
};
