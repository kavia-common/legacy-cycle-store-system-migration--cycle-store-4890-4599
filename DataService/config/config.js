require('dotenv').config();
const fs = require('fs');

const base = {
  dialect: process.env.DB_DIALECT || 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  database: process.env.DB_NAME || 'cyclestore_db',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  logging: (process.env.DB_LOGGING || 'false') === 'true' ? console.log : false,
  dialectOptions: {}
};

if ((process.env.DB_SSL || 'false').toLowerCase() === 'true') {
  base.dialectOptions.ssl = {
    rejectUnauthorized: (process.env.DB_SSL_REJECT_UNAUTHORIZED || 'true').toLowerCase() === 'true'
  };
  if (process.env.DB_SSL_CA && fs.existsSync(process.env.DB_SSL_CA)) {
    try {
      base.dialectOptions.ssl.ca = fs.readFileSync(process.env.DB_SSL_CA, 'utf8');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Could not read DB_SSL_CA file:', e.message);
    }
  }
}

module.exports = {
  development: { ...base },
  test: { ...base, database: process.env.DB_NAME_TEST || `${base.database}_test` },
  production: { ...base }
};
