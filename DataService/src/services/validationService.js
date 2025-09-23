'use strict';

const { z } = require('zod');
const db = require('../models');

// Define validation schemas
const schemas = {
  Category: z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional(),
  }),

  Inventory: z.object({
    sku: z.string().min(1).max(100),
    name: z.string().min(1).max(255),
    quantity: z.number().int().min(0),
    price: z.number().min(0).max(999999.99),
    category_id: z.number().int().positive(),
  }),

  Customer: z.object({
    first_name: z.string().min(1).max(100),
    last_name: z.string().min(1).max(100),
    email: z.string().email().max(255),
    phone: z.string().max(20).optional(),
  }),

  Sale: z.object({
    customer_id: z.number().int().positive(),
    sale_date: z.coerce.date(),
    total_amount: z.number().min(0).max(999999.99),
    items: z.array(z.object({
      inventory_id: z.number().int().positive(),
      quantity: z.number().int().min(1),
      unit_price: z.number().min(0).max(999999.99),
    })).optional(),
  }),

  SaleItem: z.object({
    sale_id: z.number().int().positive(),
    inventory_id: z.number().int().positive(),
    quantity: z.number().int().min(1),
    unit_price: z.number().min(0).max(999999.99),
  }),

  SupportTicket: z.object({
    customer_id: z.number().int().positive(),
    subject: z.string().min(1).max(255),
    description: z.string().optional(),
    status: z.enum(['open', 'closed', 'pending']),
  }),
};

/**
 * Get schema for entity validation.
 * @param {string} entity - Entity name
 * @returns {Object|null} Zod schema if found
 */
function getSchema(entity) {
  return schemas[entity] || null;
}

/**
 * Validates entity data against schema.
 * @param {string} entity - Entity name
 * @param {Object} data - Data to validate
 * @returns {Object} Validation result
 */
// PUBLIC_INTERFACE
function validatePayload(entity, data) {
  const schema = getSchema(entity);
  if (!schema) {
    return {
      valid: false,
      errors: [`No schema for entity ${entity}`]
    };
  }

  const result = schema.safeParse(data);
  if (!result.success) {
    return {
      valid: false,
      errors: result.error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }))
    };
  }

  return {
    valid: true,
    data: result.data
  };
}

/**
 * Validates relationships for entity data.
 * @param {string} entity - Entity name
 * @param {Object} data - Data to validate
 * @returns {Promise<Object>} Validation result
 */
// PUBLIC_INTERFACE
async function validateRelationships(entity, data) {
  try {
    switch (entity) {
      case 'Inventory':
        if (data.category_id) {
          const category = await db.Category.findByPk(data.category_id);
          if (!category) {
            return {
              valid: false,
              errors: [`Category with ID ${data.category_id} not found`]
            };
          }
        }
        break;

      case 'Sale':
        if (data.customer_id) {
          const customer = await db.Customer.findByPk(data.customer_id);
          if (!customer) {
            return {
              valid: false,
              errors: [`Customer with ID ${data.customer_id} not found`]
            };
          }
        }
        if (data.items) {
          for (const item of data.items) {
            const inventory = await db.Inventory.findByPk(item.inventory_id);
            if (!inventory) {
              return {
                valid: false,
                errors: [`Inventory with ID ${item.inventory_id} not found`]
              };
            }
            if (inventory.quantity < item.quantity) {
              return {
                valid: false,
                errors: [`Insufficient quantity for inventory ID ${item.inventory_id}`]
              };
            }
          }
        }
        break;

      case 'SupportTicket':
        if (data.customer_id) {
          const customer = await db.Customer.findByPk(data.customer_id);
          if (!customer) {
            return {
              valid: false,
              errors: [`Customer with ID ${data.customer_id} not found`]
            };
          }
        }
        break;
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      errors: [`Relationship validation failed: ${error.message}`]
    };
  }
}

module.exports = {
  validatePayload,
  validateRelationships,
  getSchema
};
