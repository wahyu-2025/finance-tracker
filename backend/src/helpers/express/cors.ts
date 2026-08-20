import config from "config";
import cors from "cors";
import express from "express";

export class CorsHelper {
  static setup(app: express.Application) {
    const rawOrigins = config.get<string>("server.cors");

    console.log("CORS config:", rawOrigins);

    const corsOptions: cors.CorsOptions = {
      origin:
        rawOrigins === "*"
          ? "*"
          : (origin, callback) => {
              const allowedOrigins = rawOrigins.split(",").map((o) => o.trim());
              if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
              } else {
                callback(new Error(`CORS blocked for origin: ${origin}`));
              }
            },
      credentials: rawOrigins !== "*",
      optionsSuccessStatus: 200,
    };

    app.use(cors(corsOptions));
  }
}
