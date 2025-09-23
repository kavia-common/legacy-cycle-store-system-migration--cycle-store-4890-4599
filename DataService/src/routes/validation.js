'use strict';

const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { validatePayload } = require('../services/validationService');

/**
 * @swagger
 * tags:
 *   name: Validation
 *   description: Schema validation endpoints
 */

/**
 * @swagger
 * /api/v1/validation/{entity}:
 *   post:
 *     summary: Validate payload for entity
 *     tags: [Validation]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: entity
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Validation result
 */
router.post('/:entity', requireAuth, requireRole('viewer'), async (req, res, next) => {
  try {
    const entity = (req.params.entity || '').toLowerCase();
    const result = validatePayload(entity.charAt(0).toUpperCase() + entity.slice(1), req.body);
    res.json({ status: 'success', data: result });
  } catch (e) { next(e); }
});

module.exports = router;
