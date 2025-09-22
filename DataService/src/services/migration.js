const { MigrationTracking } = require('../models');

/**
 * PUBLIC_INTERFACE
 * Import data from a legacy source into target entity.
 * This is a stub that records tracking and echoes the request.
 * @param {Object} reqBody {source, target, options}
 */
async function importData(reqBody) {
  const { source, target, options } = reqBody || {};
  const track = await MigrationTracking.create({
    legacy_id: `legacy-${Date.now()}`,
    new_id: 0,
    entity: target || 'unknown',
    status: 'pending'
  });
  // In a real implementation, perform ETL here and update new_id and status.
  return { trackingId: track.id, source, target, options };
}

/**
 * PUBLIC_INTERFACE
 * Export data for a target into a destination.
 * @param {Object} reqBody {source, target, options}
 */
async function exportData(reqBody) {
  const { source, target, options } = reqBody || {};
  // Stub: return info only; actual export would stream or write file.
  return { exported: true, source, target, options };
}

module.exports = { importData, exportData };
