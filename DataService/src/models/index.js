'use strict';
const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const models = {};

function defineModels() {
  // Category
  models.Category = sequelize.define('Category', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
  }, { tableName: 'Category' });

  // Inventory
  models.Inventory = sequelize.define('Inventory', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    sku: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
    price: { type: DataTypes.DECIMAL(10,2), allowNull: false, validate: { min: 0 } },
    category_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  }, { tableName: 'Inventory' });

  // Customer
  models.Customer = sequelize.define('Customer', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    first_name: { type: DataTypes.STRING(100), allowNull: false },
    last_name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true, validate: { isEmail: true } },
    phone: { type: DataTypes.STRING(20), allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  }, { tableName: 'Customer', updatedAt: false });

  // Sale
  models.Sale = sequelize.define('Sale', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    customer_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    sale_date: { type: DataTypes.DATE, allowNull: false },
    total_amount: { type: DataTypes.DECIMAL(10,2), allowNull: false, validate: { min: 0 } },
  }, { tableName: 'Sale', timestamps: false });

  // SaleItem
  models.SaleItem = sequelize.define('SaleItem', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    sale_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    inventory_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
    unit_price: { type: DataTypes.DECIMAL(10,2), allowNull: false, validate: { min: 0 } },
  }, { tableName: 'SaleItem', timestamps: false });

  // SupportTicket
  models.SupportTicket = sequelize.define('SupportTicket', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    customer_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    subject: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.ENUM('open', 'closed', 'pending'), allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  }, { tableName: 'SupportTicket' });

  // AuditLog
  models.AuditLog = sequelize.define('AuditLog', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    entity: { type: DataTypes.STRING(100), allowNull: false },
    entity_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    action: { type: DataTypes.STRING(50), allowNull: false },
    performed_by: { type: DataTypes.STRING(100), allowNull: false },
    performed_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    details: { type: DataTypes.TEXT, allowNull: true },
  }, { tableName: 'AuditLog', updatedAt: false, createdAt: false });

  // MigrationTracking
  models.MigrationTracking = sequelize.define('MigrationTracking', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    legacy_id: { type: DataTypes.STRING(100), allowNull: false },
    new_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    entity: { type: DataTypes.STRING(100), allowNull: false },
    migrated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    status: { type: DataTypes.ENUM('pending', 'completed', 'failed'), allowNull: false },
  }, { tableName: 'MigrationTracking', updatedAt: false, createdAt: false });

  // Associations
  models.Category.hasMany(models.Inventory, { foreignKey: 'category_id' });
  models.Inventory.belongsTo(models.Category, { foreignKey: 'category_id' });

  models.Customer.hasMany(models.Sale, { foreignKey: 'customer_id' });
  models.Sale.belongsTo(models.Customer, { foreignKey: 'customer_id' });

  models.Sale.hasMany(models.SaleItem, { foreignKey: 'sale_id' });
  models.SaleItem.belongsTo(models.Sale, { foreignKey: 'sale_id' });

  models.Inventory.hasMany(models.SaleItem, { foreignKey: 'inventory_id' });
  models.SaleItem.belongsTo(models.Inventory, { foreignKey: 'inventory_id' });

  models.Customer.hasMany(models.SupportTicket, { foreignKey: 'customer_id' });
  models.SupportTicket.belongsTo(models.Customer, { foreignKey: 'customer_id' });
}

let initialized = false;
function initModels() {
  if (!initialized) {
    defineModels();
    initialized = true;
  }
  return models;
}

function getModelByEntityName(entity) {
  initModels();
  const map = {
    categories: models.Category,
    category: models.Category,
    inventory: models.Inventory,
    customers: models.Customer,
    customer: models.Customer,
    sales: models.Sale,
    saleitems: models.SaleItem,
    saleitem: models.SaleItem,
    supporttickets: models.SupportTicket,
    supportticket: models.SupportTicket,
    auditlogs: models.AuditLog,
    migrationtracking: models.MigrationTracking,
  };
  return map[entity.toLowerCase()];
}

module.exports = { initModels, models, getModelByEntityName };
