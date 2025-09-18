const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const routes = require('./routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger');
const { auditMiddleware } = require('./middleware/audit');

// Initialize express app
const app = express();

// Security & basics
app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.set('trust proxy', true);
app.use(morgan('combined'));
app.use(express.json({ limit: '1mb' }));

// Swagger docs with dynamic server URL
app.use('/docs', swaggerUi.serve, (req, res, next) => {
  const host = req.get('host');
  let protocol = req.protocol;
  const actualPort = req.socket.localPort;
  const hasPort = host.includes(':');
  const needsPort =
    !hasPort &&
    ((protocol === 'http' && actualPort !== 80) ||
     (protocol === 'https' && actualPort !== 443));
  const fullHost = needsPort ? `${host}:${actualPort}` : host;
  protocol = req.secure ? 'https' : protocol;

  const dynamicSpec = {
    ...swaggerSpec,
    servers: [
      { url: `${protocol}://${fullHost}` },
    ],
  };
  swaggerUi.setup(dynamicSpec)(req, res, next);
});

// Attach audit helper
app.use(auditMiddleware);

// Mount routes
app.use('/', routes);

// Centralized error handling
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err?.stack || err);
  const status = err.status || 500;
  const payload = {
    status: 'error',
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'Internal Server Error',
    }
  };
  res.status(status).json(payload);
});

module.exports = app;
