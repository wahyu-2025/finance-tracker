// src/types/express.d.ts
import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      auth?:  JwtPayload; // Ini tipe data yang biasanya diisi oleh express-jwt
    }
  }
}
