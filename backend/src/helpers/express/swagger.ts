import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../../swagger/swagger.json";

export class SwaggerHelper {
  static setup(app: express.Application) {
    var options = {
      explorer: false,
    };

    // Dynamically override the server URL at runtime
    swaggerDocument.servers = [
      {
        url: process.env.HOST_SWAGGER || "http://127.0.0.1:5000",
        description: "Environment " + (process.env.APP_ENV || "Development"),
      },
    ];

    console.log("URL Swagger: ", swaggerDocument.servers);

    app.use(
      "/api/docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument, options),
    );
  }
}
