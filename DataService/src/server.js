require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./db');
const { initModels } = require('./models');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

let server;

(async () => {
  try {
    initModels();
    await sequelize.authenticate();
    console.log('Database connection established.');
    server = app.listen(PORT, HOST, () => {
      console.log(`Server running at http://${HOST}:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server due to DB error:', err.message);
    process.exit(1);
  }
})();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  if (server) {
    server.close(async () => {
      console.log('HTTP server closed');
      try { await sequelize.close(); } catch (_) {}
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

module.exports = server;
