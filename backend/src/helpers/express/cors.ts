import config from "config";
import cors from "cors";
import express from "express";

export class CorsHelper {
  static setup(app: express.Application) {
    console.log("CORS:", config.get("server.cors"));
    const corsOptions: cors.CorsOptions = {
      origin: config.get("server.cors"),
      optionsSuccessStatus: 200,
    };

    app.use(cors(corsOptions));
  }
}
