'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [categories] = await queryInterface.sequelize.query('SELECT id, name FROM Category');
    const bikes = categories.find(c => c.name === 'Bikes');
    const accessories = categories.find(c => c.name === 'Accessories');
    await queryInterface.bulkInsert('Inventory', [
      { sku: 'BIKE-ROAD-001', name: 'Road Bike 54cm', quantity: 10, price: 1200.00, category_id: bikes?.id || 1, created_at: new Date(), updated_at: new Date() },
      { sku: 'LOCK-UL-001', name: 'U-Lock Heavy Duty', quantity: 50, price: 45.50, category_id: accessories?.id || 2, created_at: new Date(), updated_at: new Date() }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Inventory', null, {});
  }
};
