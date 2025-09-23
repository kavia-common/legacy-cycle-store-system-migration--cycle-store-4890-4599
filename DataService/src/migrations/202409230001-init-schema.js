'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Category', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
    });

    await queryInterface.createTable('Inventory', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      sku: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      name: { type: Sequelize.STRING(255), allowNull: false },
      quantity: { type: Sequelize.INTEGER, allowNull: false },
      price: { type: Sequelize.DECIMAL(10,2), allowNull: false },
      category_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'Category', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.createTable('Customer', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      first_name: { type: Sequelize.STRING(100), allowNull: false },
      last_name: { type: Sequelize.STRING(100), allowNull: false },
      email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      phone: { type: Sequelize.STRING(20), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.createTable('Sale', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      customer_id: {
        type: Sequelize.INTEGER.UNSIGNED, allowNull: false,
        references: { model: 'Customer', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT'
      },
      sale_date: { type: Sequelize.DATE, allowNull: false },
      total_amount: { type: Sequelize.DECIMAL(10,2), allowNull: false },
    });

    await queryInterface.createTable('SaleItem', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      sale_id: {
        type: Sequelize.INTEGER.UNSIGNED, allowNull: false,
        references: { model: 'Sale', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE'
      },
      inventory_id: {
        type: Sequelize.INTEGER.UNSIGNED, allowNull: false,
        references: { model: 'Inventory', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT'
      },
      quantity: { type: Sequelize.INTEGER, allowNull: false },
      unit_price: { type: Sequelize.DECIMAL(10,2), allowNull: false },
    });

    await queryInterface.createTable('SupportTicket', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      customer_id: {
        type: Sequelize.INTEGER.UNSIGNED, allowNull: false,
        references: { model: 'Customer', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT'
      },
      subject: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      status: { type: Sequelize.ENUM('open', 'closed', 'pending'), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.createTable('AuditLog', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      entity: { type: Sequelize.STRING(100), allowNull: false },
      entity_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      action: { type: Sequelize.STRING(50), allowNull: false },
      performed_by: { type: Sequelize.STRING(100), allowNull: false },
      performed_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      details: { type: Sequelize.TEXT, allowNull: true },
    });

    await queryInterface.createTable('MigrationTracking', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      legacy_id: { type: Sequelize.STRING(100), allowNull: false },
      new_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      entity: { type: Sequelize.STRING(100), allowNull: false },
      migrated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      status: { type: Sequelize.ENUM('pending', 'completed', 'failed'), allowNull: false },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('MigrationTracking');
    await queryInterface.dropTable('AuditLog');
    await queryInterface.dropTable('SupportTicket');
    await queryInterface.dropTable('SaleItem');
    await queryInterface.dropTable('Sale');
    await queryInterface.dropTable('Customer');
    await queryInterface.dropTable('Inventory');
    await queryInterface.dropTable('Category');
  }
};
