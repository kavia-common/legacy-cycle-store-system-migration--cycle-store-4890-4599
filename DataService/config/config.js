require('dotenv').config();

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

if ((process.env.DB_SSL || 'false') === 'true') {
  base.dialectOptions.ssl = { rejectUnauthorized: false };
}

module.exports = {
  development: { ...base },
  test: { ...base, database: process.env.DB_NAME_TEST || `${base.database}_test` },
  production: { ...base }
};
