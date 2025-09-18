'use strict';
const winston = require('winston');
const { initModels } = require('../models');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports: [new winston.transports.Console()],
});

// PUBLIC_INTERFACE
async function audit(entity, entityId, action, performedBy, details) {
  /** Write an audit log entry and console log for compliance and traceability. */
  try {
    const { AuditLog } = initModels();
    if (process.env.AUDIT_LOG_ENABLED !== 'false') {
      await AuditLog.create({
        entity,
        entity_id: entityId || 0,
        action,
        performed_by: performedBy || 'system',
        details: details ? JSON.stringify(details).slice(0, 65535) : null,
      });
    }
    logger.info(`[AUDIT] ${action} ${entity}#${entityId} by ${performedBy}`);
  } catch (err) {
    logger.error('Failed to write audit log', err);
  }
}

// PUBLIC_INTERFACE
function auditMiddleware(req, res, next) {
  /** Attach helper to request for controllers to use easily. */
  req.audit = audit;
  return next();
}

module.exports = { auditMiddleware, audit };
