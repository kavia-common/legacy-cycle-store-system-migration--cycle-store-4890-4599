'use strict';

const express = require('express');
const router = express.Router();

// PUBLIC_INTERFACE
router.get('/health', (req, res) => {
  /** Simple health endpoint for DataService bootstrap. */
  res.status(200).json({
    status: 'ok',
    message: 'DataService is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router;
