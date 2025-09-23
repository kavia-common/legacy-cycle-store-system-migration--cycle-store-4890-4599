'use strict';

const db = require('../models');
const { writeAudit } = require('../middleware/audit');

const ENTITY_MODEL_MAP = {
  categories: 'Category',
  inventory: 'Inventory', 
  customers: 'Customer',
  sales: 'Sale',
  saleitems: 'SaleItem',
  supporttickets: 'SupportTicket',
};

/**
 * Resolves the entity name to its Sequelize model.
 * @param {string} entityParam - The entity name from the request
 * @returns {Object|null} Model and name if found, null otherwise
 */
// PUBLIC_INTERFACE
function resolveModel(entityParam) {
  const key = (entityParam || '').toLowerCase();
  const modelName = ENTITY_MODEL_MAP[key] || null;
  return modelName && db[modelName] ? { model: db[modelName], name: modelName } : null;
}

/**
 * Lists entities with optional filtering.
 * @param {string} entity - The entity type to list
 * @param {Object} query - Optional query parameters
 * @returns {Promise<Array>} List of entities
 */
// PUBLIC_INTERFACE
async function listEntities(entity, query = {}) {
  const resolved = resolveModel(entity);
  if (!resolved) {
    throw Object.assign(new Error(`Unknown entity: ${entity}`), { status: 400, code: 'UNKNOWN_ENTITY' });
  }
  return resolved.model.findAll({
    where: query,
    limit: 500,
    include: getRelatedModels(resolved.model)
  });
}

/**
 * Gets an entity by ID.
 * @param {string} entity - The entity type
 * @param {string|number} id - Entity ID
 * @returns {Promise<Object>} The entity
 */
// PUBLIC_INTERFACE
async function getEntity(entity, id) {
  const resolved = resolveModel(entity);
  if (!resolved) {
    throw Object.assign(new Error(`Unknown entity: ${entity}`), { status: 400, code: 'UNKNOWN_ENTITY' });
  }
  const found = await resolved.model.findByPk(id, {
    include: getRelatedModels(resolved.model)
  });
  if (!found) {
    throw Object.assign(new Error('Not Found'), { status: 404, code: 'NOT_FOUND' });
  }
  return found;
}

/**
 * Creates a new entity.
 * @param {string} entity - The entity type
 * @param {Object} payload - Entity data
 * @returns {Promise<Object>} Created entity
 */
// PUBLIC_INTERFACE
async function createEntity(entity, payload) {
  const resolved = resolveModel(entity);
  if (!resolved) {
    throw Object.assign(new Error(`Unknown entity: ${entity}`), { status: 400, code: 'UNKNOWN_ENTITY' });
  }

  const created = await db.sequelize.transaction(async (t) => {
    const result = await resolved.model.create(payload, { transaction: t });
    
    // Log audit entry
    await writeAudit({
      entity: resolved.name,
      entityId: result.id,
      action: 'create',
      performedBy: payload._requestUser || 'system',
      details: { data: payload }
    });

    return result;
  });

  return created;
}

/**
 * Updates an entity by ID.
 * @param {string} entity - The entity type
 * @param {string|number} id - Entity ID
 * @param {Object} payload - Update data
 * @returns {Promise<Object>} Updated entity
 */
// PUBLIC_INTERFACE
async function updateEntity(entity, id, payload) {
  const resolved = resolveModel(entity);
  if (!resolved) {
    throw Object.assign(new Error(`Unknown entity: ${entity}`), { status: 400, code: 'UNKNOWN_ENTITY' });
  }

  return db.sequelize.transaction(async (t) => {
    const found = await resolved.model.findByPk(id, { transaction: t });
    if (!found) {
      throw Object.assign(new Error('Not Found'), { status: 404, code: 'NOT_FOUND' });
    }

    const updated = await found.update(payload, { transaction: t });

    // Log audit entry
    await writeAudit({
      entity: resolved.name,
      entityId: id,
      action: 'update',
      performedBy: payload._requestUser || 'system',
      details: { 
        before: found.toJSON(),
        after: updated.toJSON()
      }
    });

    return updated;
  });
}

/**
 * Deletes an entity by ID.
 * @param {string} entity - The entity type
 * @param {string|number} id - Entity ID
 * @returns {Promise<boolean>} Success status
 */
// PUBLIC_INTERFACE
async function deleteEntity(entity, id) {
  const resolved = resolveModel(entity);
  if (!resolved) {
    throw Object.assign(new Error(`Unknown entity: ${entity}`), { status: 400, code: 'UNKNOWN_ENTITY' });
  }

  return db.sequelize.transaction(async (t) => {
    const found = await resolved.model.findByPk(id, { transaction: t });
    if (!found) {
      throw Object.assign(new Error('Not Found'), { status: 404, code: 'NOT_FOUND' });
    }

    await found.destroy({ transaction: t });

    // Log audit entry
    await writeAudit({
      entity: resolved.name,
      entityId: id,
      action: 'delete',
      performedBy: 'system',
      details: { data: found.toJSON() }
    });

    return true;
  });
}

/**
 * Gets related models for eager loading.
 * @param {Object} model - Sequelize model
 * @returns {Array} Related models to include
 */
function getRelatedModels(model) {
  // Add associations based on model relationships
  const associations = [];
  
  switch(model.name) {
    case 'Inventory':
      associations.push({ model: db.Category });
      break;
    case 'Sale':
      associations.push(
        { model: db.Customer },
        { model: db.SaleItem, include: [{ model: db.Inventory }] }
      );
      break;
    case 'SaleItem':
      associations.push(
        { model: db.Sale },
        { model: db.Inventory }
      );
      break;
    case 'SupportTicket':
      associations.push({ model: db.Customer });
      break;
  }
  
  return associations;
}

module.exports = {
  resolveModel,
  listEntities,
  getEntity,
  createEntity,
  updateEntity,
  deleteEntity
};
