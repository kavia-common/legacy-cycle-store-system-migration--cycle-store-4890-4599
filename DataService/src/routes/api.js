/**
 * OpenAPI-aligned routes mapping.
 */
const express = require('express');
const router = express.Router();
const entities = require('../controllers/entities');

// PUBLIC_INTERFACE
router.get('/:entity', entities.list);
// PUBLIC_INTERFACE
router.post('/:entity', entities.create);
// PUBLIC_INTERFACE
router.get('/:entity/:id', entities.getById);
// PUBLIC_INTERFACE
router.put('/:entity/:id', entities.update);
// PUBLIC_INTERFACE
router.delete('/:entity/:id', entities.remove);

module.exports = router;
