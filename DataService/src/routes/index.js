const express = require('express');
const healthController = require('../controllers/health');
const dataRoutes = require('./data');

const router = express.Router();

// Health endpoint
/**
 * @swagger
 * /:
 *   get:
 *     summary: Health endpoint
 *     responses:
 *       200:
 *         description: Service health check passed
 */
router.get('/', healthController.check.bind(healthController));

// Data API base
router.use('/api/v1', dataRoutes);

module.exports = router;
