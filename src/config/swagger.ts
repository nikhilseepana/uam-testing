import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User Access Management API',
      version: '1.0.0',
      description: 'A comprehensive User Access Management system API with JWT authentication, role-based access control, and file-based persistence.',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token received from login endpoint'
        }
      },
      schemas: {
        UserRole: {
          type: 'string',
          enum: ['admin', 'maintainer', 'user'],
          description: 'User role with specific permissions',
          example: 'user',
          'x-enum-descriptions': {
            admin: 'Full system access - can manage all users, groups, policies, and access requests',
            maintainer: 'Limited admin access - can manage users and groups but not policies',
            user: 'Standard user access - can view data and create access requests'
          }
        },
        AccessRequestStatus: {
          type: 'string',
          enum: ['pending', 'approved', 'denied'],
          description: 'Status of an access request',
          example: 'pending',
          'x-enum-descriptions': {
            pending: 'Request is waiting for approval',
            approved: 'Request has been approved and access granted',
            denied: 'Request has been denied'
          }
        },
        AccessRequestProcessStatus: {
          type: 'string',
          enum: ['approved', 'denied'],
          description: 'Status when processing an access request (cannot be pending)',
          example: 'approved',
          'x-enum-descriptions': {
            approved: 'Approve the access request and grant access',
            denied: 'Deny the access request'
          }
        },
        PermissionResource: {
          type: 'string',
          enum: ['users', 'groups', 'policies', 'access-requests'],
          description: 'Resource that can be accessed with permissions',
          example: 'users',
          'x-enum-descriptions': {
            users: 'User management operations',
            groups: 'Group management operations',
            policies: 'Policy management operations',
            'access-requests': 'Access request management operations'
          }
        },
        PermissionAction: {
          type: 'string',
          enum: ['create', 'read', 'update', 'delete'],
          description: 'Action that can be performed on a resource',
          example: 'read',
          'x-enum-descriptions': {
            create: 'Create new entities',
            read: 'View existing entities',
            update: 'Modify existing entities',
            delete: 'Remove entities'
          }
        },
        ValidationErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              example: 'Username, email, firstName, lastName, password, and role are required'
            },
            details: {
              type: 'object',
              properties: {
                missingFields: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  example: ['email', 'firstName']
                },
                invalidFields: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: {
                        type: 'string',
                        example: 'email'
                      },
                      message: {
                        type: 'string',
                        example: 'Invalid email format'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication information is missing or invalid',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  error: {
                    type: 'string',
                    example: 'No authorization header provided'
                  }
                }
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Insufficient permissions to perform this action',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  error: {
                    type: 'string',
                    example: 'Insufficient permissions'
                  }
                }
              }
            }
          }
        },
        ValidationError: {
          description: 'Invalid input data - Missing required fields or invalid field formats',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationErrorResponse'
              },
              examples: {
                missingFields: {
                  summary: 'Missing required fields',
                  value: {
                    success: false,
                    error: 'Username, email, firstName, lastName, password, and role are required',
                    details: {
                      missingFields: ['email', 'firstName', 'lastName']
                    }
                  }
                },
                invalidEmail: {
                  summary: 'Invalid email format',
                  value: {
                    success: false,
                    error: 'Invalid email format',
                    details: {
                      invalidFields: [
                        {
                          field: 'email',
                          message: 'Invalid email format'
                        }
                      ]
                    }
                  }
                },
                invalidPassword: {
                  summary: 'Invalid password',
                  value: {
                    success: false,
                    error: 'Password must be at least 8 characters long',
                    details: {
                      invalidFields: [
                        {
                          field: 'password',
                          message: 'Password must be at least 8 characters long'
                        }
                      ]
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Authentication endpoints'
      },
      {
        name: 'Users',
        description: 'User management endpoints'
      },
      {
        name: 'Groups',
        description: 'Group management endpoints'
      },
      {
        name: 'Policies',
        description: 'Policy management endpoints'
      },
      {
        name: 'Access Requests',
        description: 'Access request management endpoints'
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts'
  ]
};

const specs = swaggerJSDoc(options);

export default specs;
