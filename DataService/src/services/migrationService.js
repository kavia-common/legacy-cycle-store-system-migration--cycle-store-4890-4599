'use strict';

const { MigrationTracking } = require('../models');

// PUBLIC_INTERFACE
async function importData({ source, target, options }) {
  /** Simulated import/migration entry recording. Real ETL logic to be plugged in. */
  if (!source || !target) throw Object.assign(new Error('source and target required'), { status: 400, code: 'VALIDATION_ERROR' });

  // In real implementation, transform and bulk insert.
  const track = await MigrationTracking.create({
    legacy_id: String(options?.legacyId || 'N/A'),
    new_id: Number(options?.newId || 0),
    entity: target,
    status: 'completed',
  });
  return { message: 'Import completed', id: track.id };
}

// PUBLIC_INTERFACE
async function exportData({ source, target, options }) {
  /** Simulated export logging. */
  return { message: `Exported from ${source} to ${target}`, count: Number(options?.count || 0) };
}

module.exports = { importData, exportData };
