const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/openapi');
const baseRoutes = require('./routes');
const api = require('./routes/api');

const entitiesRouter = require('./routes/entities');
const migrationRouter = require('./routes/migration');
const validationRouter = require('./routes/validation');
const errorHandler = require('./middleware/errorHandler');
const { sequelize } = require('./models');

// Initialize express app
const app = express();

app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(rateLimit({ windowMs: 60 * 1000, max: Number(process.env.RATE_LIMIT_MAX || 300) }));
app.set('trust proxy', true);

// Swagger with dynamic server URL
app.use('/docs', swaggerUi.serve, (req, res, next) => {
  const host = req.get('host');
  let protocol = req.protocol;
  const actualPort = req.socket.localPort;
  const hasPort = host.includes(':');
  const needsPort = !hasPort && ((protocol === 'http' && actualPort !== 80) || (protocol === 'https' && actualPort !== 443));
  const fullHost = needsPort ? `${host}:${actualPort}` : host;
  protocol = req.secure ? 'https' : protocol;

  const dynamicSpec = {
    ...swaggerSpec,
    servers: [{ url: `${protocol}://${fullHost}` }],
    tags: [
      ...(swaggerSpec.tags || []),
      { name: 'Entities', description: 'Generic CRUD for business entities' },
      { name: 'Migration', description: 'Data migration endpoints' },
      { name: 'Validation', description: 'Schema validation endpoints' },
    ],
  };
  swaggerUi.setup(dynamicSpec)(req, res, next);
});

// Parse JSON body
app.use(express.json());

// Health & base routes
app.use('/', baseRoutes);
app.use('/api', api);

// API v1 routes
app.use('/api/v1', entitiesRouter);
app.use('/api/v1/migration', migrationRouter);
app.use('/api/v1/validation', validationRouter);

// DB initialization check endpoint (no auth, for readiness probes)
app.get('/__ready', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok' });
  } catch (e) {
    res.status(500).json({ status: 'error', error: { code: 'DB_ERROR', message: e.message } });
  }
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
