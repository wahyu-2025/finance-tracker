require("dotenv").config();
const swaggerAutogen = require("swagger-autogen")({ openapi: "3.0.0" });

const doc = {
  info: {
    title: process.env.APP_NAME || "Backend",
    description:
      process.env.APP_DESCRIPTION ||
      "Purpose of this service is to Authentication",
    version: process.env.APP_VERSION || "1.0.0",
  },
  servers: [
    {
      url: process.env.HOST_SWAGGER || "http://127.0.0.1:5000",
      description: "Environment " + (process.env.APP_ENV || "Development"),
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
        refresh_token: "your-refresh-token",
      },
      UpdateRequest: {
        id: "1",
        email: "email@example.com",
        fullname: "your-fullname",
      },
      ForgotPasswordRequest: {
        email: "email@example.com",
      },
      ChangePasswordRequest: {
        token: "reset-token",
        newPassword: "12345567",
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
        price: 5.0,
      },
      Paging: {
        filter: { any: "Product 1" },
        page: 1,
        limit: 25,
        with_deleted: true,
        order_field: "name",
        order_direction: "desc",
      },
      CreateCategoryRequest: {
        name: "Food & Beverage",
        type: "EXPENSE",
      },
      UpdateCategoryRequest: {
        name: "Food & Beverage",
        type: "EXPENSE",
      },
      CreateTransactionRequest: {
        wallet_id: 1,
        category_id: 1,
        type: "EXPENSE",
        amount: 50000,
        is_pending: "N",
        transaction_date: "2026-10-26",
        description: "Makan siang",
      },
      UpdateTransactionRequest: {
        wallet_id: 1,
        category_id: 1,
        type: "EXPENSE",
        amount: 50000,
        transaction_date: "2026-10-26",
        description: "Makan siang",
      },
      CreateCustomRecapRequest: {
        name: "Rekap Oktober 2026",
        start_date: "2026-10-01",
        end_date: "2026-10-31",
      },
      UpdateCustomRecapRequest: {
        name: "Rekap Oktober 2026",
        start_date: "2026-10-01",
        end_date: "2026-10-31",
      },
      CreateWalletRequest: {
        name: "BCA Utama",
        type: "BANK",
        initial_balance: 1000000,
        balance: 1000000,
      },
      CreateTransferBalance: {
        from_wallet_id: 1,
        to_wallet_id: 2,
        amount: 50000,
        transfer_date: "2026-10-26",
        description: "Transfer antar wallet",
      },
      CreateBudgetRequest: {
        name: "Budget 2026",
        start_date: "2026-10-01",
        end_date: "2026-12-31",
      },
      UpdateBudgetRequest: {
        name: "Budget 2026",
        start_date: "2026-10-01",
        end_date: "2026-12-31",
      },
      CreateBudgetItemsRequest: {
        budget_items: [
          {
            category_id: 1,
            amount: 50000,
          },
        ],
      },
      UpdateBudgetItemsRequest: {
        category_id: 1,
        amount: 50000,
      },
    },
    parameters: {
      // Anda dapat mendefinisikan parameter lainnya di sini jika diperlukan
    },
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
  },
  paths: {
    "/api/auth/register": {
      post: {
        summary: "Register a new user",
        description: "Endpoint for user registration",
        operationId: "register",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "User registered successfully",
          },
          400: {
            description: "Invalid input data",
          },
        },
      },
    },
  },
};

const outputFile = "./swagger.json";
const routes = ["../routes/private.ts", "../routes/public.ts"];

swaggerAutogen(outputFile, routes, doc);
