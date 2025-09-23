const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

(async () => {
  try {
    if (process.env.DB_SYNC === 'true') {
      await sequelize.sync();
    } else {
      await sequelize.authenticate();
    }
  } catch (e) {
    console.error('Database connection failed:', e.message);
  }
})();

const server = app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`${signal} received: closing HTTP server`);
  server.close(async () => {
    try {
      await sequelize.close();
    } catch (e) {
      // ignore
    }
    console.log('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = server;
