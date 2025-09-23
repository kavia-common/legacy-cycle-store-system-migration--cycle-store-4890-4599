'use strict';

const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const dbConfig = require('../config/database');

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig
);

// Centralized models
const db = {};

db.Category = require('./models.Category')(sequelize, DataTypes);
db.Inventory = require('./models.Inventory')(sequelize, DataTypes);
db.Customer = require('./models.Customer')(sequelize, DataTypes);
db.Sale = require('./models.Sale')(sequelize, DataTypes);
db.SaleItem = require('./models.SaleItem')(sequelize, DataTypes);
db.SupportTicket = require('./models.SupportTicket')(sequelize, DataTypes);
db.AuditLog = require('./models.AuditLog')(sequelize, DataTypes);
db.MigrationTracking = require('./models.MigrationTracking')(sequelize, DataTypes);

// Relationships
db.Inventory.belongsTo(db.Category, { foreignKey: 'category_id' });
db.Sale.belongsTo(db.Customer, { foreignKey: 'customer_id' });
db.SaleItem.belongsTo(db.Sale, { foreignKey: 'sale_id' });
db.SaleItem.belongsTo(db.Inventory, { foreignKey: 'inventory_id' });
db.SupportTicket.belongsTo(db.Customer, { foreignKey: 'customer_id' });

// Export
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
