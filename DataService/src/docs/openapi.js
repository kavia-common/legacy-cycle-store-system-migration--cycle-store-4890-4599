'use strict';

const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Data Service REST API',
      version: '1.0.0',
      description: 'CRUD, migration, and validation endpoints for Data Service. Secured with Bearer JWT. Includes audit logging.',
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      },
      schemas: {
        EntityEnvelope: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['success', 'error'] },
            data: { type: 'object' },
            error: { type: 'object', nullable: true }
          },
          required: ['status']
        }
      }
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    './src/routes/*.js',
  ],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
