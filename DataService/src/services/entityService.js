'use strict';

const db = require('../models');

const ENTITY_MODEL_MAP = {
  categories: 'Category',
  inventory: 'Inventory',
  customers: 'Customer',
  sales: 'Sale',
  saleitems: 'SaleItem',
  supporttickets: 'SupportTicket',
};

function resolveModel(entityParam) {
  const key = (entityParam || '').toLowerCase();
  const modelName = ENTITY_MODEL_MAP[key] || null;
  return modelName && db[modelName] ? { model: db[modelName], name: modelName } : null;
}

// PUBLIC_INTERFACE
async function listEntities(entity, query = {}) {
  /** List entities for the given entity type with optional filtering. */
  const resolved = resolveModel(entity);
  if (!resolved) throw Object.assign(new Error(`Unknown entity: ${entity}`), { status: 400, code: 'UNKNOWN_ENTITY' });
  return resolved.model.findAll({ where: query, limit: 500 });
}

// PUBLIC_INTERFACE
async function getEntity(entity, id) {
  /** Get an entity by primary key. */
  const resolved = resolveModel(entity);
  if (!resolved) throw Object.assign(new Error(`Unknown entity: ${entity}`), { status: 400, code: 'UNKNOWN_ENTITY' });
  const found = await resolved.model.findByPk(id);
  if (!found) throw Object.assign(new Error('Not Found'), { status: 404, code: 'NOT_FOUND' });
  return found;
}

// PUBLIC_INTERFACE
async function createEntity(entity, payload) {
  /** Create an entity record. */
  const resolved = resolveModel(entity);
  if (!resolved) throw Object.assign(new Error(`Unknown entity: ${entity}`), { status: 400, code: 'UNKNOWN_ENTITY' });
  const created = await resolved.model.create(payload);
  return created;
}

// PUBLIC_INTERFACE
async function updateEntity(entity, id, payload) {
  /** Update an entity record by id. */
  const resolved = resolveModel(entity);
  if (!resolved) throw Object.assign(new Error(`Unknown entity: ${entity}`), { status: 400, code: 'UNKNOWN_ENTITY' });
  const found = await resolved.model.findByPk(id);
  if (!found) throw Object.assign(new Error('Not Found'), { status: 404, code: 'NOT_FOUND' });
  await found.update(payload);
  return found;
}

// PUBLIC_INTERFACE
async function deleteEntity(entity, id) {
  /** Delete an entity record by id. */
  const resolved = resolveModel(entity);
  if (!resolved) throw Object.assign(new Error(`Unknown entity: ${entity}`), { status: 400, code: 'UNKNOWN_ENTITY' });
  const found = await resolved.model.findByPk(id);
  if (!found) throw Object.assign(new Error('Not Found'), { status: 404, code: 'NOT_FOUND' });
  await found.destroy();
  return true;
}

module.exports = {
  resolveModel,
  listEntities,
  getEntity,
  createEntity,
  updateEntity,
  deleteEntity,
};
