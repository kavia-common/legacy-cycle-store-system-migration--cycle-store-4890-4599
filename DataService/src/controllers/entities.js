'use strict';

const entityService = require('../services/entityService');
const { validatePayload, validateRelationships } = require('../services/validationService');

function envelopeSuccess(data) {
  return { status: 'success', data };
}

function envelopeError(code, message) {
  return {
    status: 'error',
    error: { code, message }
  };
}

/**
 * List entities with optional filtering
 */
// PUBLIC_INTERFACE
exports.list = async (req, res, next) => {
  try {
    const { entity } = req.params;
    const data = await entityService.listEntities(entity, req.query);
    return res.status(200).json(envelopeSuccess(data));
  } catch (e) {
    return next(e);
  }
};

/**
 * Create new entity
 */
// PUBLIC_INTERFACE
exports.create = async (req, res, next) => {
  try {
    const { entity } = req.params;
    
    // Validate payload
    const validationResult = validatePayload(entity, req.body);
    if (!validationResult.valid) {
      return res.status(400).json(envelopeError('VALIDATION_ERROR', validationResult.errors[0].message));
    }

    // Validate relationships
    const relationshipValidation = await validateRelationships(entity, req.body);
    if (!relationshipValidation.valid) {
      return res.status(400).json(envelopeError('VALIDATION_ERROR', relationshipValidation.errors[0]));
    }

    // Add request user for audit
    const payload = {
      ...req.body,
      _requestUser: req.user?.sub || req.user?.email
    };

    const record = await entityService.createEntity(entity, payload);
    return res.status(201).json(envelopeSuccess(record));
  } catch (e) {
    return next(e);
  }
};

/**
 * Get entity by ID
 */
// PUBLIC_INTERFACE
exports.getById = async (req, res, next) => {
  try {
    const { entity, id } = req.params;
    const data = await entityService.getEntity(entity, id);
    if (!data) {
      return res.status(404).json(envelopeError('NOT_FOUND', 'Not found'));
    }
    return res.status(200).json(envelopeSuccess(data));
  } catch (e) {
    return next(e);
  }
};

/**
 * Update entity by ID
 */
// PUBLIC_INTERFACE
exports.update = async (req, res, next) => {
  try {
    const { entity, id } = req.params;

    // Validate payload
    const validationResult = validatePayload(entity, req.body);
    if (!validationResult.valid) {
      return res.status(400).json(envelopeError('VALIDATION_ERROR', validationResult.errors[0].message));
    }

    // Validate relationships
    const relationshipValidation = await validateRelationships(entity, req.body);
    if (!relationshipValidation.valid) {
      return res.status(400).json(envelopeError('VALIDATION_ERROR', relationshipValidation.errors[0]));
    }

    // Add request user for audit
    const payload = {
      ...req.body,
      _requestUser: req.user?.sub || req.user?.email
    };

    const updated = await entityService.updateEntity(entity, id, payload);
    return res.status(200).json(envelopeSuccess(updated));
  } catch (e) {
    return next(e);
  }
};

/**
 * Delete entity by ID
 */
// PUBLIC_INTERFACE
exports.remove = async (req, res, next) => {
  try {
    const { entity, id } = req.params;
    await entityService.deleteEntity(entity, id);
    return res.status(204).send();
  } catch (e) {
    return next(e);
  }
};
