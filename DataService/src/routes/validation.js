'use strict';

const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/auth');
const { validatePayload, validateRelationships } = require('../services/validationService');

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
 *     summary: Validate data for entity
 *     tags: [Validation]
 *     parameters:
 *       - in: path
 *         name: entity
 *         required: true
 *         schema:
 *           type: string
 *         description: Entity name to validate against
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Validation result
 *       400:
 *         description: Invalid entity or payload
 */
router.post('/:entity', requireRole('viewer'), async (req, res, next) => {
  try {
    const entity = (req.params.entity || '').charAt(0).toUpperCase() + 
                  (req.params.entity || '').slice(1);

    // Validate schema
    const schemaResult = validatePayload(entity, req.body);
    if (!schemaResult.valid) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'VALIDATION_ERROR',
          errors: schemaResult.errors
        }
      });
    }

    // Validate relationships if schema validation passed
    const relationshipResult = await validateRelationships(entity, req.body);
    if (!relationshipResult.valid) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'VALIDATION_ERROR',
          errors: relationshipResult.errors
        }
      });
    }

    // All validations passed
    return res.json({
      status: 'success',
      data: {
        valid: true,
        validated: req.body
      }
    });

  } catch (e) {
    next(e);
  }
});

module.exports = router;
