const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'cyclestore_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: (process.env.DB_LOGGING || 'false') === 'true' ? console.log : false,
    dialectOptions: (process.env.DB_SSL || 'false') === 'true' ? { ssl: { rejectUnauthorized: false } } : {}
  }
);

// Load all model files in this directory
const db = {};
const modelsDir = __dirname;

fs.readdirSync(modelsDir)
  .filter((file) => file !== 'index.js' && file.endsWith('.js'))
  .forEach((file) => {
    const model = require(path.join(modelsDir, file))(sequelize);
    db[model.name] = model;
  });

// Associations
const { Category, Inventory, Customer, Sale, SaleItem, SupportTicket } = db;

if (Category && Inventory) {
  Inventory.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
  Category.hasMany(Inventory, { foreignKey: 'category_id', as: 'items' });
}

if (Customer && Sale) {
  Sale.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
  Customer.hasMany(Sale, { foreignKey: 'customer_id', as: 'sales' });
}

if (Sale && SaleItem) {
  SaleItem.belongsTo(Sale, { foreignKey: 'sale_id', as: 'sale' });
  Sale.hasMany(SaleItem, { foreignKey: 'sale_id', as: 'items' });
}

if (SaleItem && Inventory) {
  SaleItem.belongsTo(Inventory, { foreignKey: 'inventory_id', as: 'inventoryItem' });
  Inventory.hasMany(SaleItem, { foreignKey: 'inventory_id', as: 'saleItems' });
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
