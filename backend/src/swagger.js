/**
 * @fileoverview Swagger/OpenAPI configuration for the Client Timesheet API.
 * This module sets up interactive API documentation using swagger-jsdoc and swagger-ui-express.
 * 
 * @module swagger
 * @description Provides auto-generated, interactive API documentation accessible at /api-docs.
 * The documentation is generated from JSDoc comments in route files using OpenAPI 3.0 specification.
 * 
 * @example
 * // Access the interactive documentation
 * // Navigate to http://localhost:3001/api-docs in your browser
 * 
 * @see {@link https://swagger.io/specification/|OpenAPI Specification}
 * @see {@link https://github.com/Surnet/swagger-jsdoc|swagger-jsdoc}
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

/**
 * OpenAPI specification options for swagger-jsdoc.
 * Defines the API metadata and paths to scan for JSDoc annotations.
 * 
 * @constant {Object} options
 * @property {Object} definition - OpenAPI specification definition
 * @property {string} definition.openapi - OpenAPI version (3.0.0)
 * @property {Object} definition.info - API metadata
 * @property {Object[]} definition.servers - Server URLs
 * @property {Object} definition.components - Reusable components (schemas, security)
 * @property {string[]} apis - Paths to files containing JSDoc annotations
 */
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Client Timesheet API',
      version: '1.0.0',
      description: `
## Overview

The Client Timesheet API provides a comprehensive REST interface for managing time tracking data.
This API enables users to track billable hours across multiple clients with full CRUD operations.

## Features

- **Authentication**: Email-based authentication with JWT tokens
- **Client Management**: Create, read, update, and delete client records
- **Work Entry Tracking**: Log hours worked with descriptions and dates
- **Reporting**: Generate reports with aggregated hours and export to CSV/PDF

## Authentication

All endpoints (except login and health check) require authentication via the \`x-user-email\` header.
After logging in, include your email in subsequent requests:

\`\`\`
x-user-email: your.email@example.com
\`\`\`

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **General endpoints**: 100 requests per 15 minutes per IP
- **Login endpoint**: 5 attempts per 15 minutes per IP

## Error Handling

All errors follow a consistent format:
\`\`\`json
{
  "error": "Error message description"
}
\`\`\`

Common HTTP status codes:
- \`200\` - Success
- \`201\` - Created
- \`400\` - Bad Request (validation error)
- \`401\` - Unauthorized
- \`404\` - Not Found
- \`500\` - Internal Server Error
      `,
      contact: {
        name: 'API Support',
        url: 'https://github.com/Cognition-Partner-Workshops/client-timesheet-app'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      },
      {
        url: '{protocol}://{host}',
        description: 'Production server',
        variables: {
          protocol: {
            enum: ['http', 'https'],
            default: 'https'
          },
          host: {
            default: 'your-production-domain.com'
          }
        }
      }
    ],
    components: {
      securitySchemes: {
        emailAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-user-email',
          description: 'User email for authentication. Obtain by logging in first.'
        }
      },
      schemas: {
        User: {
          type: 'object',
          description: 'Represents a user in the system',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User\'s email address (unique identifier)',
              example: 'john.doe@example.com'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the user was created',
              example: '2024-01-15T10:30:00.000Z'
            }
          },
          required: ['email']
        },
        Client: {
          type: 'object',
          description: 'Represents a client for time tracking',
          properties: {
            id: {
              type: 'integer',
              description: 'Unique client identifier',
              example: 1
            },
            name: {
              type: 'string',
              description: 'Client name (required, 1-255 characters)',
              minLength: 1,
              maxLength: 255,
              example: 'Acme Corporation'
            },
            description: {
              type: 'string',
              nullable: true,
              description: 'Optional client description (max 1000 characters)',
              maxLength: 1000,
              example: 'Enterprise software development project'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the client was created',
              example: '2024-01-15T10:30:00.000Z'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the client was last updated',
              example: '2024-01-20T14:45:00.000Z'
            }
          },
          required: ['id', 'name']
        },
        ClientInput: {
          type: 'object',
          description: 'Input schema for creating a new client',
          properties: {
            name: {
              type: 'string',
              description: 'Client name (required)',
              minLength: 1,
              maxLength: 255,
              example: 'Acme Corporation'
            },
            description: {
              type: 'string',
              description: 'Optional client description',
              maxLength: 1000,
              example: 'Enterprise software development project'
            }
          },
          required: ['name']
        },
        WorkEntry: {
          type: 'object',
          description: 'Represents a work entry (time logged for a client)',
          properties: {
            id: {
              type: 'integer',
              description: 'Unique work entry identifier',
              example: 1
            },
            client_id: {
              type: 'integer',
              description: 'ID of the associated client',
              example: 1
            },
            client_name: {
              type: 'string',
              description: 'Name of the associated client (included in responses)',
              example: 'Acme Corporation'
            },
            hours: {
              type: 'number',
              format: 'float',
              description: 'Hours worked (0.01 to 24.00)',
              minimum: 0.01,
              maximum: 24,
              example: 8.5
            },
            description: {
              type: 'string',
              nullable: true,
              description: 'Optional description of work performed',
              maxLength: 1000,
              example: 'Implemented user authentication feature'
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Date when the work was performed (YYYY-MM-DD)',
              example: '2024-01-15'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the entry was created',
              example: '2024-01-15T17:00:00.000Z'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the entry was last updated',
              example: '2024-01-15T17:30:00.000Z'
            }
          },
          required: ['id', 'client_id', 'hours', 'date']
        },
        WorkEntryInput: {
          type: 'object',
          description: 'Input schema for creating a new work entry',
          properties: {
            clientId: {
              type: 'integer',
              description: 'ID of the client to log time for',
              example: 1
            },
            hours: {
              type: 'number',
              format: 'float',
              description: 'Hours worked (0.01 to 24.00)',
              minimum: 0.01,
              maximum: 24,
              example: 8.5
            },
            description: {
              type: 'string',
              description: 'Optional description of work performed',
              maxLength: 1000,
              example: 'Implemented user authentication feature'
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Date when the work was performed (YYYY-MM-DD)',
              example: '2024-01-15'
            }
          },
          required: ['clientId', 'hours', 'date']
        },
        ClientReport: {
          type: 'object',
          description: 'Aggregated report for a specific client',
          properties: {
            client: {
              $ref: '#/components/schemas/Client'
            },
            workEntries: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/WorkEntry'
              },
              description: 'List of all work entries for this client'
            },
            totalHours: {
              type: 'number',
              format: 'float',
              description: 'Sum of all hours worked for this client',
              example: 42.5
            },
            entryCount: {
              type: 'integer',
              description: 'Total number of work entries',
              example: 5
            }
          }
        },
        Error: {
          type: 'object',
          description: 'Standard error response',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
              example: 'Resource not found'
            }
          }
        },
        HealthCheck: {
          type: 'object',
          description: 'Health check response',
          properties: {
            status: {
              type: 'string',
              description: 'Server status',
              example: 'OK'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Current server timestamp',
              example: '2024-01-15T10:30:00.000Z'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Health',
        description: 'Server health check endpoints'
      },
      {
        name: 'Authentication',
        description: 'User authentication and session management'
      },
      {
        name: 'Clients',
        description: 'Client management operations (CRUD)'
      },
      {
        name: 'Work Entries',
        description: 'Time tracking and work entry management'
      },
      {
        name: 'Reports',
        description: 'Report generation and data export'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/server.js']
};

/**
 * Generated OpenAPI specification from JSDoc annotations.
 * @constant {Object} specs
 */
const specs = swaggerJsdoc(options);

/**
 * Swagger UI configuration options.
 * Customizes the appearance and behavior of the documentation interface.
 * 
 * @constant {Object} swaggerUiOptions
 * @property {Object} customCss - Custom CSS styles for the UI
 * @property {Object} customSiteTitle - Browser tab title
 * @property {Object} swaggerOptions - Swagger UI specific options
 */
const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Client Timesheet API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true
  }
};

/**
 * Sets up Swagger documentation routes on the Express app.
 * 
 * @function setupSwagger
 * @param {Object} app - Express application instance
 * @description Mounts the Swagger UI at /api-docs and serves the raw OpenAPI spec at /api-docs.json
 * 
 * @example
 * const express = require('express');
 * const { setupSwagger } = require('./swagger');
 * 
 * const app = express();
 * setupSwagger(app);
 * // Documentation available at http://localhost:3001/api-docs
 */
function setupSwagger(app) {
  // Serve Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));
  
  // Serve raw OpenAPI spec as JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
  
  console.log('Swagger documentation available at /api-docs');
}

module.exports = { setupSwagger, specs };
