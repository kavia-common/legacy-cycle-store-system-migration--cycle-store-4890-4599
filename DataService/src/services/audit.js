const { AuditLog } = require('../models');

/**
 * Create an audit log entry.
 * PUBLIC_INTERFACE
 * @param {Object} params Parameters for audit log.
 * @param {string} params.entity Entity name, e.g., 'Inventory'
 * @param {number} params.entityId Primary key of the entity
 * @param {string} params.action Action performed (CREATE, UPDATE, DELETE)
 * @param {string} params.performedBy Who performed the action
 * @param {Object} [params.details] Optional details to serialize
 * @returns {Promise<void>}
 */
async function createAudit({ entity, entityId, action, performedBy, details }) {
  if (!AuditLog) return;
  const enabled = (process.env.AUDIT_ENABLED || 'true') === 'true';
  if (!enabled) return;
  await AuditLog.create({
    entity,
    entity_id: entityId,
    action,
    performed_by: performedBy || 'system',
    details: details ? JSON.stringify(details) : null
  });
}

module.exports = { createAudit };
