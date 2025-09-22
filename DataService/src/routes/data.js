const express = require('express');
const Joi = require('joi');
const schemas = require('../validation/schemas');
const { createAudit } = require('../services/audit');
const { importData, exportData } = require('../services/migration');
const db = require('../models');

const router = express.Router();

const ENTITY_MAP = {
  categories: { model: db.Category, key: 'Category', schema: schemas.category },
  inventory: { model: db.Inventory, key: 'Inventory', schema: schemas.inventory },
  customers: { model: db.Customer, key: 'Customer', schema: schemas.customer },
  sales: { model: db.Sale, key: 'Sale', schema: schemas.sale },
  'sale-items': { model: db.SaleItem, key: 'SaleItem', schema: schemas.saleitem },
  'support-tickets': { model: db.SupportTicket, key: 'SupportTicket', schema: schemas.supportticket }
};

function getActor(req) {
  const headerName = (process.env.ACTOR_HEADER || 'x-actor').toLowerCase();
  return req.headers[headerName] || 'system';
}

/**
 * @swagger
 * /api/v1/{entity}:
 *   get:
 *     summary: List entities
 *     tags: [Data]
 *     parameters:
 *       - in: path
 *         name: entity
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: size
 *         schema: { type: integer, default: 25 }
 *     responses:
 *       200:
 *         description: List of entities.
 *   post:
 *     summary: Create new entity
 *     tags: [Data]
 *     parameters:
 *       - in: path
 *         name: entity
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       201:
 *         description: Entity created
 */
router.get('/:entity', async (req, res) => {
  try {
    const { entity } = req.params;
    const entry = ENTITY_MAP[entity.toLowerCase()];
    if (!entry) return res.status(404).json({ status: 'error', error: { code: 'NOT_FOUND', message: 'Entity not supported' } });

    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const size = Math.min(Math.max(parseInt(req.query.size || '25', 10), 1), 100);
    const offset = (page - 1) * size;

    const result = await entry.model.findAndCountAll({ offset, limit: size, order: [['id', 'ASC']] });
    return res.json({ status: 'success', data: { items: result.rows, total: result.count, page, size } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', error: { code: 'INTERNAL', message: 'Internal Server Error' } });
  }
});

router.post('/:entity', async (req, res) => {
  try {
    const { entity } = req.params;
    const entry = ENTITY_MAP[entity.toLowerCase()];
    if (!entry) return res.status(404).json({ status: 'error', error: { code: 'NOT_FOUND', message: 'Entity not supported' } });

    const schema = entry.schema;
    if (schema && schema.isJoi) {
      const { error } = schema.validate(req.body, { abortEarly: false });
      if (error) {
        return res.status(400).json({
          status: 'error',
          error: { code: 'VALIDATION_FAILED', message: error.details.map(d => d.message).join('; ') }
        });
      }
    }

    const created = await entry.model.create(req.body);
    await createAudit({
      entity: entry.key,
      entityId: created.id,
      action: 'CREATE',
      performedBy: getActor(req),
      details: req.body
    });
    return res.status(201).json({ status: 'success', data: created });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', error: { code: 'INTERNAL', message: 'Internal Server Error' } });
  }
});

/**
 * @swagger
 * /api/v1/{entity}/{id}:
 *   get:
 *     summary: Retrieve entity by ID
 *     tags: [Data]
 *     parameters:
 *       - in: path
 *         name: entity
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Entity details
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update entity by ID
 *     tags: [Data]
 *     parameters:
 *       - in: path
 *         name: entity
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       200:
 *         description: Entity updated
 *   delete:
 *     summary: Delete entity by ID
 *     tags: [Data]
 *     parameters:
 *       - in: path
 *         name: entity
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Deleted
 */
router.get('/:entity/:id', async (req, res) => {
  try {
    const { entity, id } = req.params;
    const entry = ENTITY_MAP[entity.toLowerCase()];
    if (!entry) return res.status(404).json({ status: 'error', error: { code: 'NOT_FOUND', message: 'Entity not supported' } });

    const item = await entry.model.findByPk(id);
    if (!item) return res.status(404).json({ status: 'error', error: { code: 'NOT_FOUND', message: 'Not found' } });

    return res.json({ status: 'success', data: item });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', error: { code: 'INTERNAL', message: 'Internal Server Error' } });
  }
});

router.put('/:entity/:id', async (req, res) => {
  try {
    const { entity, id } = req.params;
    const entry = ENTITY_MAP[entity.toLowerCase()];
    if (!entry) return res.status(404).json({ status: 'error', error: { code: 'NOT_FOUND', message: 'Entity not supported' } });

    const schema = entry.schema;
    if (schema && schema.isJoi) {
      const { error } = schema.validate(req.body, { abortEarly: false });
      if (error) {
        return res.status(400).json({
          status: 'error',
          error: { code: 'VALIDATION_FAILED', message: error.details.map(d => d.message).join('; ') }
        });
      }
    }

    const found = await entry.model.findByPk(id);
    if (!found) return res.status(404).json({ status: 'error', error: { code: 'NOT_FOUND', message: 'Not found' } });

    await found.update(req.body);
    await createAudit({
      entity: entry.key,
      entityId: Number(id),
      action: 'UPDATE',
      performedBy: getActor(req),
      details: req.body
    });

    return res.json({ status: 'success', data: found });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', error: { code: 'INTERNAL', message: 'Internal Server Error' } });
  }
});

router.delete('/:entity/:id', async (req, res) => {
  try {
    const { entity, id } = req.params;
    const entry = ENTITY_MAP[entity.toLowerCase()];
    if (!entry) return res.status(404).json({ status: 'error', error: { code: 'NOT_FOUND', message: 'Entity not supported' } });

    const found = await entry.model.findByPk(id);
    if (!found) return res.status(404).json({ status: 'error', error: { code: 'NOT_FOUND', message: 'Not found' } });

    await found.destroy();

    await createAudit({
      entity: entry.key,
      entityId: Number(id),
      action: 'DELETE',
      performedBy: getActor(req),
      details: null
    });

    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', error: { code: 'INTERNAL', message: 'Internal Server Error' } });
  }
});

/**
 * @swagger
 * /api/v1/migration/import:
 *   post:
 *     summary: Import legacy data
 *     tags: [Migration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               source: { type: string }
 *               target: { type: string }
 *               options: { type: object }
 *             required: [source, target]
 *     responses:
 *       200:
 *         description: Import result
 */
router.post('/migration/import', async (req, res) => {
  try {
    const result = await importData(req.body);
    return res.json({ status: 'success', data: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', error: { code: 'INTERNAL', message: 'Internal Server Error' } });
  }
});

/**
 * @swagger
 * /api/v1/migration/export:
 *   post:
 *     summary: Export data
 *     tags: [Migration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               source: { type: string }
 *               target: { type: string }
 *               options: { type: object }
 *             required: [source, target]
 *     responses:
 *       200:
 *         description: Export result
 */
router.post('/migration/export', async (req, res) => {
  try {
    const result = await exportData(req.body);
    return res.json({ status: 'success', data: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', error: { code: 'INTERNAL', message: 'Internal Server Error' } });
  }
});

/**
 * @swagger
 * /api/v1/validation/{entity}:
 *   post:
 *     summary: Validate entity data
 *     tags: [Validation]
 *     parameters:
 *       - in: path
 *         name: entity
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       200:
 *         description: Validation result
 */
router.post('/validation/:entity', async (req, res) => {
  try {
    const { entity } = req.params;
    const entry = ENTITY_MAP[entity.toLowerCase()];
    if (!entry) return res.status(404).json({ status: 'error', error: { code: 'NOT_FOUND', message: 'Entity not supported' } });

    const schema = entry.schema || Joi.any();
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(200).json({
        status: 'success',
        data: { valid: false, errors: error.details.map(d => ({ message: d.message, path: d.path })) }
      });
    }
    return res.status(200).json({ status: 'success', data: { valid: true } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', error: { code: 'INTERNAL', message: 'Internal Server Error' } });
  }
});

module.exports = router;
