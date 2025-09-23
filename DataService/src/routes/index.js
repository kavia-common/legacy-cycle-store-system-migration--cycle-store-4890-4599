'use strict';

const express = require('express');
const router = express.Router();
const healthController = require('../controllers/health');

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns basic service health status
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Service is healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/', healthController.check);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Detailed health check
 *     description: Returns detailed service health status including dependencies
 *     responses:
 *       200:
 *         description: Service health details
 */
router.get('/health', healthController.check);

/**
 * @swagger
 * /__ready:
 *   get:
 *     summary: Readiness probe endpoint
 *     description: Kubernetes readiness probe endpoint
 *     responses:
 *       200:
 *         description: Service is ready
 *       503:
 *         description: Service is not ready
 */
router.get('/__ready', (req, res) => {
  res.status(200).json({ status: 'ready' });
});

module.exports = router;
