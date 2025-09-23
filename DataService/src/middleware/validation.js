'use strict';

const { z } = require('zod');

const schemas = {
  Category: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
  }),
  Inventory: z.object({
    sku: z.string().min(1),
    name: z.string().min(1),
    quantity: z.number().int().min(0),
    price: z.number().min(0),
    category_id: z.number().int().positive(),
  }),
  Customer: z.object({
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  Sale: z.object({
    customer_id: z.number().int().positive(),
    sale_date: z.coerce.date(),
    total_amount: z.number().min(0),
  }),
  SaleItem: z.object({
    sale_id: z.number().int().positive(),
    inventory_id: z.number().int().positive(),
    quantity: z.number().int().min(1),
    unit_price: z.number().min(0),
  }),
  SupportTicket: z.object({
    customer_id: z.number().int().positive(),
    subject: z.string().min(1),
    description: z.string().optional(),
    status: z.enum(['open', 'closed', 'pending']),
  }),
};

function getSchema(entity) {
  return schemas[entity] || null;
}

// PUBLIC_INTERFACE
function validateEntity(entity) {
  /** Validate request body against entity schema using Zod. */
  return (req, res, next) => {
    const schema = getSchema(entity);
    if (!schema) return res.status(400).json({ status: 'error', error: { code: 'UNKNOWN_ENTITY', message: `No schema for ${entity}` } });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ status: 'error', error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
    }
    req.body = parsed.data;
    next();
  };
}

module.exports = { validateEntity, getSchema };
