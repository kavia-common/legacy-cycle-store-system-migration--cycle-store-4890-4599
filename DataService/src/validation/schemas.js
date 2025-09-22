const Joi = require('joi');

const category = Joi.object({
  name: Joi.string().max(255).required(),
  description: Joi.string().allow('', null)
});

const inventory = Joi.object({
  sku: Joi.string().max(100).required(),
  name: Joi.string().max(255).required(),
  quantity: Joi.number().integer().min(0).required(),
  price: Joi.number().precision(2).min(0).required(),
  category_id: Joi.number().integer().required()
});

const customer = Joi.object({
  first_name: Joi.string().max(100).required(),
  last_name: Joi.string().max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().max(20).allow('', null)
});

const sale = Joi.object({
  customer_id: Joi.number().integer().required(),
  sale_date: Joi.date().iso().required(),
  total_amount: Joi.number().precision(2).min(0).required()
});

const saleItem = Joi.object({
  sale_id: Joi.number().integer().required(),
  inventory_id: Joi.number().integer().required(),
  quantity: Joi.number().integer().min(1).required(),
  unit_price: Joi.number().precision(2).min(0).required()
});

const supportTicket = Joi.object({
  customer_id: Joi.number().integer().required(),
  subject: Joi.string().max(255).required(),
  description: Joi.string().allow('', null),
  status: Joi.string().valid('open', 'closed', 'pending').required()
});

const schemas = {
  category,
  inventory,
  customer,
  sale,
  saleitem: saleItem,
  supportticket: supportTicket
};

module.exports = schemas;
