'use strict';

const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/auth');
const { auditTrail } = require('../middleware/audit');
const entities = require('../controllers/entities');

/**
 * @swagger
 * tags:
 *   name: Entities
 *   description: Entity CRUD operations
 */

/**
 * @swagger
 * /api/v1/entities/{entity}:
 *   get:
 *     summary: List entities
 *     tags: [Entities]
 *     parameters:
 *       - in: path
 *         name: entity
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of entities
 */
router.get('/:entity', requireRole('viewer'), entities.list);

/**
 * @swagger
 * /api/v1/entities/{entity}:
 *   post:
 *     summary: Create new entity
 *     tags: [Entities]
 *     parameters:
 *       - in: path
 *         name: entity
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Entity created
 *       400:
 *         description: Validation error
 */
router.post('/:entity', requireRole('editor'), auditTrail('entity', 'create'), entities.create);

/**
 * @swagger
 * /api/v1/entities/{entity}/{id}:
 *   get:
 *     summary: Get entity by ID
 *     tags: [Entities]
 *     parameters:
 *       - in: path
 *         name: entity
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Entity details
 *       404:
 *         description: Not found
 */
router.get('/:entity/:id', requireRole('viewer'), entities.getById);

/**
 * @swagger
 * /api/v1/entities/{entity}/{id}:
 *   put:
 *     summary: Update entity
 *     tags: [Entities]
 *     parameters:
 *       - in: path
 *         name: entity
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Entity updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Not found
 */
router.put('/:entity/:id', requireRole('editor'), auditTrail('entity', 'update'), entities.update);

/**
 * @swagger
 * /api/v1/entities/{entity}/{id}:
 *   delete:
 *     summary: Delete entity
 *     tags: [Entities]
 *     parameters:
 *       - in: path
 *         name: entity
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Entity deleted
 *       404:
 *         description: Not found
 */
router.delete('/:entity/:id', requireRole('editor'), auditTrail('entity', 'delete'), entities.remove);

module.exports = router;
