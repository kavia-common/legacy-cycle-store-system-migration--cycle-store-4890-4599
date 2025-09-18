'use strict';
const { sequelize } = require('../db');
const { initModels, getModelByEntityName } = require('../models');
const { getSchemaByEntity } = require('../validation/schemas');
const { ok, error } = require('../utils/responses');

initModels();

// PUBLIC_INTERFACE
async function listEntities(req, res) {
  /** List entities for a given collection name. Supports pagination later (basic now). */
  const { entity } = req.params;
  const Model = getModelByEntityName(entity);
  if (!Model) return res.status(404).json(error('NOT_FOUND', 'Entity not found'));
  const records = await Model.findAll({ limit: 500 });
  return res.json(ok(records));
}

// PUBLIC_INTERFACE
async function getEntity(req, res) {
  /** Retrieve an entity by ID. */
  const { entity, id } = req.params;
  const Model = getModelByEntityName(entity);
  if (!Model) return res.status(404).json(error('NOT_FOUND', 'Entity not found'));
  const record = await Model.findByPk(id);
  if (!record) return res.status(404).json(error('NOT_FOUND', 'Record not found'));
  return res.json(ok(record));
}

// PUBLIC_INTERFACE
async function createEntity(req, res) {
  /** Create a new entity instance with validation and audit logging. */
  const { entity } = req.params;
  const Model = getModelByEntityName(entity);
  if (!Model) return res.status(404).json(error('NOT_FOUND', 'Entity not found'));

  const schema = getSchemaByEntity(entity);
  if (schema) {
    const { error: vErr } = schema.validate(req.body, { abortEarly: false });
    if (vErr) return res.status(400).json(error('VALIDATION_ERROR', vErr.details.map(d => d.message).join('; ')));
  }

  const tx = await sequelize.transaction();
  try {
    const created = await Model.create(req.body, { transaction: tx });
    await req.audit(entity, created.id, 'CREATE', req.user?.id, { body: req.body });
    await tx.commit();
    return res.status(201).json(ok(created));
  } catch (err) {
    await tx.rollback();
    return res.status(400).json(error('CREATE_FAILED', err.message));
  }
}

// PUBLIC_INTERFACE
async function updateEntity(req, res) {
  /** Update an entity by ID with validation and audit logging. */
  const { entity, id } = req.params;
  const Model = getModelByEntityName(entity);
  if (!Model) return res.status(404).json(error('NOT_FOUND', 'Entity not found'));

  const schema = getSchemaByEntity(entity);
  if (schema) {
    const { error: vErr } = schema.validate(req.body, { abortEarly: false });
    if (vErr) return res.status(400).json(error('VALIDATION_ERROR', vErr.details.map(d => d.message).join('; ')));
  }

  const instance = await Model.findByPk(id);
  if (!instance) return res.status(404).json(error('NOT_FOUND', 'Record not found'));

  const tx = await sequelize.transaction();
  try {
    await instance.update(req.body, { transaction: tx });
    await req.audit(entity, instance.id, 'UPDATE', req.user?.id, { body: req.body });
    await tx.commit();
    return res.json(ok(instance));
  } catch (err) {
    await tx.rollback();
    return res.status(400).json(error('UPDATE_FAILED', err.message));
  }
}

// PUBLIC_INTERFACE
async function deleteEntity(req, res) {
  /** Delete an entity by ID with audit logging. */
  const { entity, id } = req.params;
  const Model = getModelByEntityName(entity);
  if (!Model) return res.status(404).json(error('NOT_FOUND', 'Entity not found'));

  const instance = await Model.findByPk(id);
  if (!instance) return res.status(404).json(error('NOT_FOUND', 'Record not found'));

  const tx = await sequelize.transaction();
  try {
    await instance.destroy({ transaction: tx });
    await req.audit(entity, id, 'DELETE', req.user?.id, {});
    await tx.commit();
    return res.status(204).send();
  } catch (err) {
    await tx.rollback();
    return res.status(400).json(error('DELETE_FAILED', err.message));
  }
}

// PUBLIC_INTERFACE
async function validateEntityData(req, res) {
  /** Validate payload against entity schema. */
  const { entity } = req.params;
  const schema = getSchemaByEntity(entity);
  if (!schema) return res.status(404).json(error('NOT_FOUND', 'Entity not found or no validation schema'));
  const { error: vErr, value } = schema.validate(req.body.data || req.body, { abortEarly: false });
  if (vErr) {
    return res.status(200).json(ok({ valid: false, errors: vErr.details.map(d => d.message) }));
  }
  return res.status(200).json(ok({ valid: true, data: value }));
}

// PUBLIC_INTERFACE
async function migrateImport(req, res) {
  /** Import legacy data given a mapping; simplistic handler demo with tracking. */
  const { source, target, options } = req.body || {};
  if (!source || !target) {
    return res.status(400).json(error('VALIDATION_ERROR', 'source and target are required'));
  }
  const TargetModel = getModelByEntityName(target);
  if (!TargetModel) return res.status(400).json(error('VALIDATION_ERROR', 'Unknown target entity'));

  // Example: assume options.records is an array of objects to insert.
  const records = (options && options.records) || [];
  const { MigrationTracking } = initModels();

  const tx = await sequelize.transaction();
  try {
    const results = [];
    for (const r of records) {
      const created = await TargetModel.create(r, { transaction: tx });
      await MigrationTracking.create({
        legacy_id: String(r.legacy_id || r.id || 'unknown'),
        new_id: created.id,
        entity: target,
        status: 'completed',
      }, { transaction: tx });
      results.push(created);
    }
    await req.audit('migration', 0, 'IMPORT', req.user?.id, { source, target, count: results.length });
    await tx.commit();
    return res.json(ok({ imported: results.length }));
  } catch (err) {
    await tx.rollback();
    return res.status(400).json(error('MIGRATION_FAILED', err.message));
  }
}

// PUBLIC_INTERFACE
async function migrateExport(req, res) {
  /** Export data for a given entity with optional filters in options. */
  const { source, target, options } = req.body || {};
  const entity = source || target;
  const Model = getModelByEntityName(entity);
  if (!Model) return res.status(400).json(error('VALIDATION_ERROR', 'Unknown entity'));
  const where = (options && options.where) || {};
  const rows = await Model.findAll({ where, limit: 5000 });
  await req.audit('migration', 0, 'EXPORT', req.user?.id, { entity, count: rows.length });
  return res.json(ok({ exported: rows.length, rows }));
}

module.exports = {
  listEntities,
  getEntity,
  createEntity,
  updateEntity,
  deleteEntity,
  validateEntityData,
  migrateImport,
  migrateExport,
};
