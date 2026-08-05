import cors from "cors";
import express from "express";
import compression from "compression";

export class CompressionHelper {
  static setup(app: express.Application) {
    const compressionOptions: compression.CompressionOptions = {
      level: 6,
      memLevel: 8,
    };

    app.use(compression(compressionOptions));
  }
}
