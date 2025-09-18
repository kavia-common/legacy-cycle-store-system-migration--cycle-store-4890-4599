const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Data Service REST API',
      version: '1.0.0',
      description: 'RESTful API for data persistence, migration, and validation. Provides CRUD, migration, and validation endpoints for business entities. Secured with JWT, supports audit logging, and follows OpenAPI standards.',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
