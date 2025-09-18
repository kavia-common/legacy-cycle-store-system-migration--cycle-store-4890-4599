'use strict';
/**
 * Sequelize initialization and DB connection.
 * Uses environment variables for configuration.
 */
const { Sequelize } = require('sequelize');

const {
  MYSQL_HOST,
  MYSQL_PORT,
  MYSQL_DB,
  MYSQL_USER,
  MYSQL_PASSWORD,
  NODE_ENV,
} = process.env;

const sequelize = new Sequelize(MYSQL_DB, MYSQL_USER, MYSQL_PASSWORD, {
  host: MYSQL_HOST,
  port: MYSQL_PORT ? Number(MYSQL_PORT) : 3306,
  dialect: 'mysql',
  logging: NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    multipleStatements: false,
  },
  define: {
    underscored: true,
    freezeTableName: true,
  }
});

module.exports = { sequelize };
