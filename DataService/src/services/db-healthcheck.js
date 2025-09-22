const { sequelize } = require('../models');

// PUBLIC_INTERFACE
async function pingDb() {
  try {
    await sequelize.authenticate();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

module.exports = { pingDb };
