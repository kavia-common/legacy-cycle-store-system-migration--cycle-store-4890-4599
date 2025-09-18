'use strict';
require('dotenv').config();
const { sequelize } = require('./index');
const { initModels } = require('../models');

(async () => {
  try {
    initModels();
    await sequelize.authenticate();
    console.log('DB connection established.');
    await sequelize.sync({ alter: true }); // Note: for production, use migrations
    console.log('Models synchronized.');
    process.exit(0);
  } catch (err) {
    console.error('DB sync failed:', err);
    process.exit(1);
  }
})();
