'use strict';
const express = require('express');
const { authenticate, requireRoles } = require('../middleware/auth');
const ctrl = require('../controllers/entity');

const router = express.Router();

// All endpoints require auth
router.use(authenticate);

/**
 * @swagger
 * /{entity}:
 *   get:
 *     summary: List entities
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: entity
 *         schema: { type: string }
 *         required: true
 *     responses:
 *       200:
 *         description: List of entities
 *   post:
 *     summary: Create new entity
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: entity
 *         schema: { type: string }
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       201:
 *         description: Entity created
 */
router.get('/:entity', ctrl.listEntities);
router.post('/:entity', ctrl.createEntity);

/**
 * @swagger
 * /{entity}/{id}:
 *   get:
 *     summary: Retrieve entity by ID
 *     security: [{ bearerAuth: [] }]
 *   put:
 *     summary: Update entity by ID
 *     security: [{ bearerAuth: [] }]
 *   delete:
 *     summary: Delete entity by ID
 *     security: [{ bearerAuth: [] }]
 */
router.get('/:entity/:id', ctrl.getEntity);
router.put('/:entity/:id', ctrl.updateEntity);
// Require admin role for delete for RBAC demo
router.delete('/:entity/:id', requireRoles(...(process.env.RBAC_ADMIN_ROLES ? process.env.RBAC_ADMIN_ROLES.split(',') : ['admin'])), ctrl.deleteEntity);

/**
 * @swagger
 * /validation/{entity}:
 *   post:
 *     summary: Validate entity data
 *     security: [{ bearerAuth: [] }]
 */
router.post('/validation/:entity', ctrl.validateEntityData);

/**
 * @swagger
 * /migration/import:
 *   post:
 *     summary: Import legacy data
 *     security: [{ bearerAuth: [] }]
 * /migration/export:
 *   post:
 *     summary: Export data
 *     security: [{ bearerAuth: [] }]
 */
router.post('/migration/import', requireRoles(...(process.env.RBAC_ADMIN_ROLES ? process.env.RBAC_ADMIN_ROLES.split(',') : ['admin'])), ctrl.migrateImport);
router.post('/migration/export', requireRoles(...(process.env.RBAC_ADMIN_ROLES ? process.env.RBAC_ADMIN_ROLES.split(',') : ['admin'])), ctrl.migrateExport);

module.exports = router;
