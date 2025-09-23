'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/openapi');

const app = express();

// Basic security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Request tracking
app.use((req, res, next) => {
  req.reqId = req.headers['x-request-id'] || Math.random().toString(36).slice(2);
  res.setHeader('x-request-id', req.reqId);
  next();
});

// Auth middleware
const { requireAuth } = require('./middleware/auth');

// API routes
app.use('/', require('./routes/index'));
app.use('/api/v1/entities', requireAuth, require('./routes/entities'));
app.use('/api/v1/migration', requireAuth, require('./routes/migration'));
app.use('/api/v1/validation', requireAuth, require('./routes/validation'));

// API documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handler
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

module.exports = app;
