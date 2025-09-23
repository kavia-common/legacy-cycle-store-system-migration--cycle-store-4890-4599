'use strict';

const db = require('../models');
const { writeAudit } = require('../middleware/audit');
const { encrypt } = require('../utils/crypto');
const { ValidationError } = require('sequelize');

/**
 * Imports data from legacy system.
 * @param {Object} params - Import parameters
 * @returns {Promise<Object>} Import result
 */
// PUBLIC_INTERFACE
async function importData({ source, target, options = {} }) {
  if (!source || !target) {
    throw Object.assign(new Error('source and target required'), { status: 400, code: 'VALIDATION_ERROR' });
  }

  // Begin transaction
  const result = await db.sequelize.transaction(async (t) => {
    try {
      // Create migration tracking record
      const track = await db.MigrationTracking.create({
        legacy_id: String(options?.legacyId || source),
        new_id: 0, // Will be updated after import
        entity: target,
        status: 'pending'
      }, { transaction: t });

      // Process import data based on target entity
      let importedData;
      switch (target.toLowerCase()) {
        case 'customer':
          importedData = await importCustomers(source, options, t);
          break;
        case 'inventory':
          importedData = await importInventory(source, options, t);
          break;
        case 'sale':
          importedData = await importSales(source, options, t);
          break;
        default:
          throw new Error(`Unsupported target entity: ${target}`);
      }

      // Update tracking record
      await track.update({
        new_id: importedData.id,
        status: 'completed'
      }, { transaction: t });

      // Log audit
      await writeAudit({
        entity: 'Migration',
        entityId: track.id,
        action: 'import',
        performedBy: options.performedBy || 'system',
        details: {
          source,
          target,
          success: true,
          count: importedData ? 1 : 0
        }
      });

      return { 
        message: 'Import completed',
        id: track.id,
        data: importedData 
      };

    } catch (error) {
      // Log failed import
      await writeAudit({
        entity: 'Migration',
        entityId: 0,
        action: 'import_failed',
        performedBy: options.performedBy || 'system',
        details: {
          source,
          target,
          error: error.message
        }
      });

      throw error;
    }
  });

  return result;
}

/**
 * Exports data for specified parameters.
 * @param {Object} params - Export parameters
 * @returns {Promise<Object>} Export result
 */
// PUBLIC_INTERFACE
async function exportData({ source, target, options = {} }) {
  if (!source || !target) {
    throw Object.assign(new Error('source and target required'), { status: 400, code: 'VALIDATION_ERROR' });
  }

  try {
    // Get export data based on source entity
    let exportData;
    switch (source.toLowerCase()) {
      case 'customer':
        exportData = await db.Customer.findAll({
          where: options.filter || {},
          include: [
            { model: db.Sale },
            { model: db.SupportTicket }
          ]
        });
        break;
      case 'inventory':
        exportData = await db.Inventory.findAll({
          where: options.filter || {},
          include: [
            { model: db.Category }
          ]
        });
        break;
      case 'sale':
        exportData = await db.Sale.findAll({
          where: options.filter || {},
          include: [
            { model: db.Customer },
            { model: db.SaleItem, include: [{ model: db.Inventory }] }
          ]
        });
        break;
      default:
        throw new Error(`Unsupported source entity: ${source}`);
    }

    // Transform data if needed
    const transformedData = options.transform ? 
      await transformExportData(exportData, source, target) : 
      exportData;

    // Log export
    await writeAudit({
      entity: 'Migration',
      entityId: 0,
      action: 'export',
      performedBy: options.performedBy || 'system',
      details: {
        source,
        target,
        count: transformedData.length
      }
    });

    return {
      message: `Exported from ${source} to ${target}`,
      count: transformedData.length,
      data: transformedData
    };

  } catch (error) {
    // Log failed export
    await writeAudit({
      entity: 'Migration',
      entityId: 0,
      action: 'export_failed',
      performedBy: options.performedBy || 'system',
      details: {
        source,
        target,
        error: error.message
      }
    });

    throw error;
  }
}

/**
 * Imports customer data.
 * @private
 */
async function importCustomers(source, options, transaction) {
  const customerData = {
    first_name: options.data.firstName,
    last_name: options.data.lastName,
    email: options.data.email,
    phone: options.data.phone
  };

  // Encrypt sensitive data if needed
  if (process.env.ENCRYPT_CUSTOMER_DATA === 'true') {
    customerData.phone = encrypt(customerData.phone);
  }

  const customer = await db.Customer.create(customerData, { transaction });
  return customer;
}

/**
 * Imports inventory data.
 * @private
 */
async function importInventory(source, options, transaction) {
  const inventory = await db.Inventory.create({
    sku: options.data.sku,
    name: options.data.name,
    quantity: options.data.quantity,
    price: options.data.price,
    category_id: options.data.categoryId
  }, { transaction });
  return inventory;
}

/**
 * Imports sales data.
 * @private
 */
async function importSales(source, options, transaction) {
  const sale = await db.Sale.create({
    customer_id: options.data.customerId,
    sale_date: options.data.saleDate,
    total_amount: options.data.totalAmount
  }, { transaction });

  // Create sale items
  if (options.data.items && Array.isArray(options.data.items)) {
    await Promise.all(options.data.items.map(item =>
      db.SaleItem.create({
        sale_id: sale.id,
        inventory_id: item.inventoryId,
        quantity: item.quantity,
        unit_price: item.unitPrice
      }, { transaction })
    ));
  }

  return sale;
}

/**
 * Transforms export data based on target format.
 * @private
 */
async function transformExportData(data, source, target) {
  // Add custom transformation logic here if needed
  return data;
}

module.exports = {
  importData,
  exportData
};
