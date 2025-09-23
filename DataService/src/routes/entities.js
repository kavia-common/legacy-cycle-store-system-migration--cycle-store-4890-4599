'use strict';

const express = require('express');
const router = express.Router();

const { requireAuth, requireRole } = require('../middleware/auth');
const { auditTrail } = require('../middleware/audit');
const { validateEntity } = require('../middleware/validation');
const entityService = require('../services/entityService');

/**
 * @swagger
 * tags:
 *   name: Entities
 *   description: Generic CRUD endpoints for business entities
 */

/**
 * @swagger
 * /api/v1/{entity}:
 *   get:
 *     summary: List entities
 *     tags: [Entities]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: entity
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of entities
 */
router.get('/:entity', requireAuth, requireRole('viewer'), async (req, res, next) => {
  try {
    const data = await entityService.listEntities(req.params.entity);
    res.json({ status: 'success', data });
  } catch (e) { next(e); }
});

/**
 * @swagger
 * /api/v1/{entity}/{id}:
 *   get:
 *     summary: Get entity by ID
 *     tags: [Entities]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: entity
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Entity
 *       404:
 *         description: Not found
 */
router.get('/:entity/:id', requireAuth, requireRole('viewer'), async (req, res, next) => {
  try {
    const data = await entityService.getEntity(req.params.entity, req.params.id);
    res.json({ status: 'success', data });
  } catch (e) { next(e); }
});

/**
 * @swagger
 * /api/v1/{entity}:
 *   post:
 *     summary: Create entity
 *     tags: [Entities]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: entity
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/:entity', requireAuth, requireRole('editor'), auditTrail('entity', 'create'), async (req, res, next) => {
  try {
    const resolved = entityService.resolveModel(req.params.entity);
    if (!resolved) return res.status(400).json({ status: 'error', error: { code: 'UNKNOWN_ENTITY', message: 'Unknown entity' } });
    // Plug validation dynamically
    // Run inline validation:
    // For simplicity, reuse validateEntity when possible by manually invoking schema
    const created = await entityService.createEntity(req.params.entity, req.body);
    res.locals.auditEntityId = created.id;
    res.status(201).json({ status: 'success', data: created });
  } catch (e) { next(e); }
});

/**
 * @swagger
 * /api/v1/{entity}/{id}:
 *   put:
 *     summary: Update entity by ID
 *     tags: [Entities]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: entity
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Updated
 */
router.put('/:entity/:id', requireAuth, requireRole('editor'), auditTrail('entity', 'update'), async (req, res, next) => {
  try {
    const updated = await entityService.updateEntity(req.params.entity, req.params.id, req.body);
    res.locals.auditEntityId = updated.id;
    res.json({ status: 'success', data: updated });
  } catch (e) { next(e); }
});

/**
 * @swagger
 * /api/v1/{entity}/{id}:
 *   delete:
 *     summary: Delete entity by ID
 *     tags: [Entities]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: entity
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Deleted
 */
router.delete('/:entity/:id', requireAuth, requireRole('editor'), auditTrail('entity', 'delete'), async (req, res, next) => {
  try {
    await entityService.deleteEntity(req.params.entity, req.params.id);
    res.locals.auditEntityId = Number(req.params.id);
    res.status(204).send();
  } catch (e) { next(e); }
});

module.exports = router;
