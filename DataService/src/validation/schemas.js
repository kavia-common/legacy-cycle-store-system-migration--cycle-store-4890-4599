'use strict';
const Joi = require('joi');

const schemas = {
  Category: Joi.object({
    name: Joi.string().max(255).required(),
    description: Joi.string().allow('', null),
  }),
  Inventory: Joi.object({
    sku: Joi.string().max(100).required(),
    name: Joi.string().max(255).required(),
    quantity: Joi.number().integer().min(0).required(),
    price: Joi.number().min(0).required(),
    category_id: Joi.number().integer().required(),
  }),
  Customer: Joi.object({
    first_name: Joi.string().max(100).required(),
    last_name: Joi.string().max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().max(20).allow('', null),
  }),
  Sale: Joi.object({
    customer_id: Joi.number().integer().required(),
    sale_date: Joi.date().iso().required(),
    total_amount: Joi.number().min(0).required(),
  }),
  SaleItem: Joi.object({
    sale_id: Joi.number().integer().required(),
    inventory_id: Joi.number().integer().required(),
    quantity: Joi.number().integer().min(1).required(),
    unit_price: Joi.number().min(0).required(),
  }),
  SupportTicket: Joi.object({
    customer_id: Joi.number().integer().required(),
    subject: Joi.string().max(255).required(),
    description: Joi.string().allow('', null),
    status: Joi.string().valid('open', 'closed', 'pending').required(),
  }),
};

function getSchemaByEntity(entityName) {
  const map = {
    categories: 'Category',
    category: 'Category',
    inventory: 'Inventory',
    customers: 'Customer',
    customer: 'Customer',
    sales: 'Sale',
    saleitems: 'SaleItem',
    saleitem: 'SaleItem',
    supporttickets: 'SupportTicket',
    supportticket: 'SupportTicket',
  };
  const model = map[(entityName || '').toLowerCase()];
  if (!model) return null;
  return schemas[model];
}

module.exports = { getSchemaByEntity, schemas };
