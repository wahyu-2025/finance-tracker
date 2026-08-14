require('dotenv').config();
const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0' });
const config = require('config');

const doc = {
  info: {
    title: config.get('app.name'),
    description: config.get('app.description'),
    version: config.get('app.version'),
  },
  servers: [
    {
      url: config.get('server.host_swagger'),
      description: 'Environment ' + config.get('app.env'),
    },
  ],
  components: {
    schemas: {
      // Skema untuk request body pada registrasi user
      RegisterRequest: {
          email: "email@example.com",
          password: "123456",
          fullname: "your-fullname",
      },
      LoginRequest: {
          email: "email@example.com",
          password: "123456",
      },
      RefreshTokenRequest: {
          refresh_token: "your-refresh-token"
      },
      UpdateRequest: {
          id: "1",
          email: "email@example.com",
          fullname: "your-fullname"
      },
      ForgotPasswordRequest: {
          email: "email@example.com"
      },
      ChangePasswordRequest: {
          token: "reset-token",
          newPassword: "12345567"
      },
      ProductCreate: {
          name: "Product 1",
          desc: "Description of Product 1",
          price: "5.00",
      },
      ProductUpdate: {
          product_id: 1,
          name: "Product 1",
          desc: "Description of Product 1",
          price: 5.00,
      },
      Paging: {
          filter: { any: "Product 1"},
          page: 1,
          limit: 25,
          with_deleted: true,
          order_field: 'name',
          order_direction: 'desc'
      },
    },
    parameters: {
      // Anda dapat mendefinisikan parameter lainnya di sini jika diperlukan
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
      },
    },
  },
  paths: {
    '/api/auth/register': {
      post: {
        summary: 'Register a new user',
        description: 'Endpoint for user registration',
        operationId: 'register',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'User registered successfully',
          },
          400: {
            description: 'Invalid input data',
          },
        },
      },
    },
  },
};

const outputFile = './swagger.json';
const routes = ['../routes/private.ts', '../routes/public.ts'];

swaggerAutogen(outputFile, routes, doc);


