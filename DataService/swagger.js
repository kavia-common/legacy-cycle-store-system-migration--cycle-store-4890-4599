const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Data Service REST API',
      version: '1.0.0',
      description: 'RESTful API for data persistence, migration, validation, and audit logging.'
    },
    servers: [
      { url: 'http://localhost:3000' }
    ],
    tags: [
      { name: 'Health', description: 'Service healthcheck' },
      { name: 'Data', description: 'Generic CRUD for entities' },
      { name: 'Migration', description: 'Data import/export endpoints' },
      { name: 'Validation', description: 'Schema validation endpoints' }
    ]
  },
  apis: ['./src/routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
