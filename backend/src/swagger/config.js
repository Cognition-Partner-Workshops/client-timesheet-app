const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Employee Time Tracking API',
      version: '1.0.0',
      description: 'API for tracking employee hours across multiple clients. Enables users to log work entries, manage client information, and generate reports for billing and analysis.',
      contact: {
        name: 'API Support'
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
      }
    ],
    components: {
      securitySchemes: {
        EmailAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-user-email',
          description: 'User email for authentication'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp'
            }
          }
        },
        Client: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Client unique identifier'
            },
            name: {
              type: 'string',
              description: 'Client name',
              minLength: 1,
              maxLength: 255
            },
            description: {
              type: 'string',
              description: 'Client description',
              maxLength: 1000
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        ClientInput: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
              description: 'Client name',
              minLength: 1,
              maxLength: 255
            },
            description: {
              type: 'string',
              description: 'Client description',
              maxLength: 1000
            }
          }
        },
        ClientUpdateInput: {
          type: 'object',
          minProperties: 1,
          properties: {
            name: {
              type: 'string',
              description: 'Client name',
              minLength: 1,
              maxLength: 255
            },
            description: {
              type: 'string',
              description: 'Client description',
              maxLength: 1000
            }
          }
        },
        WorkEntry: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Work entry unique identifier'
            },
            client_id: {
              type: 'integer',
              description: 'Associated client ID'
            },
            client_name: {
              type: 'string',
              description: 'Associated client name'
            },
            hours: {
              type: 'number',
              format: 'float',
              description: 'Hours worked',
              minimum: 0,
              maximum: 24
            },
            description: {
              type: 'string',
              description: 'Work description',
              maxLength: 1000
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Date of work entry'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        WorkEntryInput: {
          type: 'object',
          required: ['clientId', 'hours', 'date'],
          properties: {
            clientId: {
              type: 'integer',
              description: 'Associated client ID'
            },
            hours: {
              type: 'number',
              format: 'float',
              description: 'Hours worked',
              minimum: 0,
              maximum: 24
            },
            description: {
              type: 'string',
              description: 'Work description',
              maxLength: 1000
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Date of work entry (ISO format)'
            }
          }
        },
        WorkEntryUpdateInput: {
          type: 'object',
          minProperties: 1,
          properties: {
            clientId: {
              type: 'integer',
              description: 'Associated client ID'
            },
            hours: {
              type: 'number',
              format: 'float',
              description: 'Hours worked',
              minimum: 0,
              maximum: 24
            },
            description: {
              type: 'string',
              description: 'Work description',
              maxLength: 1000
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Date of work entry (ISO format)'
            }
          }
        },
        ClientReport: {
          type: 'object',
          properties: {
            client: {
              $ref: '#/components/schemas/Client'
            },
            workEntries: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/WorkEntry'
              }
            },
            totalHours: {
              type: 'number',
              format: 'float',
              description: 'Total hours worked for this client'
            },
            entryCount: {
              type: 'integer',
              description: 'Number of work entries'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            }
          }
        },
        LoginInput: {
          type: 'object',
          required: ['email'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Success message'
            },
            user: {
              $ref: '#/components/schemas/User'
            }
          }
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'OK'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Health',
        description: 'Health check endpoint'
      },
      {
        name: 'Authentication',
        description: 'User authentication endpoints'
      },
      {
        name: 'Clients',
        description: 'Client management endpoints'
      },
      {
        name: 'Work Entries',
        description: 'Work entry management endpoints'
      },
      {
        name: 'Reports',
        description: 'Report generation and export endpoints'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/server.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
