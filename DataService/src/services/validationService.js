'use strict';

const { getSchema } = require('../middleware/validation');

// PUBLIC_INTERFACE
function validatePayload(entity, data) {
  /** Validate payload for entity using zod schema. */
  const schema = getSchema(entity);
  if (!schema) {
    return { valid: false, errors: [`No schema for entity ${entity}`] };
  }
  const result = schema.safeParse(data);
  if (!result.success) {
    return { valid: false, errors: [result.error.message] };
  }
  return { valid: true, data: result.data };
}

module.exports = { validatePayload };
