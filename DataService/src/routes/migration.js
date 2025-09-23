'use strict';

const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { auditTrail } = require('../middleware/audit');
const migrationService = require('../services/migrationService');

/**
 * @swagger
 * tags:
 *   name: Migration
 *   description: Data import/export endpoints
 */

/**
 * @swagger
 * /api/v1/migration/import:
 *   post:
 *     summary: Import legacy data
 *     tags: [Migration]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Import result
 */
router.post('/import', requireAuth, requireRole('admin'), auditTrail('migration', 'import'), async (req, res, next) => {
  try {
    const result = await migrationService.importData(req.body || {});
    res.locals.auditEntityId = result.id;
    res.json({ status: 'success', data: result });
  } catch (e) { next(e); }
});

/**
 * @swagger
 * /api/v1/migration/export:
 *   post:
 *     summary: Export data
 *     tags: [Migration]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Export result
 */
router.post('/export', requireAuth, requireRole('admin'), auditTrail('migration', 'export'), async (req, res, next) => {
  try {
    const result = await migrationService.exportData(req.body || {});
    res.locals.auditEntityId = 0;
    res.json({ status: 'success', data: result });
  } catch (e) { next(e); }
});

module.exports = router;
