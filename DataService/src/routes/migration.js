'use strict';

const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/auth');
const { importData, exportData } = require('../services/migrationService');

/**
 * @swagger
 * tags:
 *   name: Migration
 *   description: Data migration endpoints
 */

/**
 * @swagger
 * /api/v1/migration/import:
 *   post:
 *     summary: Import data from legacy system
 *     tags: [Migration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               source:
 *                 type: string
 *               target:
 *                 type: string
 *               options:
 *                 type: object
 *     responses:
 *       200:
 *         description: Import successful
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Import failed
 */
router.post('/import', requireRole('admin'), async (req, res, next) => {
  try {
    const result = await importData({
      ...req.body,
      options: {
        ...req.body.options,
        performedBy: req.user?.sub || req.user?.email
      }
    });
    return res.json({
      status: 'success',
      data: result
    });
  } catch (e) {
    next(e);
  }
});

/**
 * @swagger
 * /api/v1/migration/export:
 *   post:
 *     summary: Export data to specified target
 *     tags: [Migration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               source:
 *                 type: string
 *               target:
 *                 type: string
 *               options:
 *                 type: object
 *     responses:
 *       200:
 *         description: Export successful
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Export failed
 */
router.post('/export', requireRole('admin'), async (req, res, next) => {
  try {
    const result = await exportData({
      ...req.body,
      options: {
        ...req.body.options,
        performedBy: req.user?.sub || req.user?.email
      }
    });
    return res.json({
      status: 'success',
      data: result
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
