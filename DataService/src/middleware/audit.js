'use strict';

const { AuditLog } = require('../models');

// PUBLIC_INTERFACE
async function writeAudit({ entity, entityId, action, performedBy, details }) {
  /** Write an audit log entry to AuditLog table. */
  try {
    await AuditLog.create({
      entity,
      entity_id: entityId,
      action,
      performed_by: performedBy || 'system',
      details: details ? JSON.stringify(details) : null,
    });
  } catch (e) {
    // Do not fail the main operation on audit failure.
    console.error('Audit write failed:', e.message);
  }
}

// PUBLIC_INTERFACE
function auditTrail(entity, action) {
  /** Middleware to write audit entry using result from res.locals.auditEntityId */
  return async (req, res, next) => {
    res.on('finish', async () => {
      if (String(res.statusCode).startsWith('2') && res.locals.auditEntityId) {
        await writeAudit({
          entity,
          entityId: res.locals.auditEntityId,
          action,
          performedBy: (req.user && req.user.sub) || (req.user && req.user.email) || 'unknown',
          details: { path: req.originalUrl, method: req.method, ip: req.ip },
        });
      }
    });
    next();
  };
}

module.exports = { writeAudit, auditTrail };
