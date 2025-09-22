const healthService = require('../services/health');
const { pingDb } = require('../services/db-healthcheck');

class HealthController {
  async check(req, res) {
    const healthStatus = healthService.getStatus();
    const dbStatus = await pingDb();
    return res.status(200).json({ ...healthStatus, db: dbStatus });
  }
}

module.exports = new HealthController();
