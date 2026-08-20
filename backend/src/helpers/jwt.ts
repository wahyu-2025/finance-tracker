import { NextFunction, Response } from 'express';
import { Logger, ILogObj } from 'tslog';
import { Request, expressjwt } from "express-jwt";
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { Language } from '../langs/lang';
import { ReturnHelper } from './express/return';
import express from 'express';

const log: Logger<ILogObj> = new Logger({ name: '[JwtHelper]', type: 'pretty' });

export default class JwtHelper {
    static secure = (app: express.Application) => {

        var publicKey = fs.readFileSync("src/helpers/key/public.key");

        app.use(
            expressjwt({
                secret: publicKey, algorithms: ["RS256"],
                getToken: function fromHeaderOrQuerystring(req): any {
                    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
                        return req.headers.authorization.split(' ')[1];
                    } else if (req.query && req.query.token) {
                        return req.query.token;
                    }
                    return null;
                },
            }).unless({ path: ["/token", "/api/auth/refresh_token"] }),
            function (req: Request, res: Response, next: NextFunction) {
                console.log("Authorization:", req.headers.authorization);
                console.log("AUTH:", req.auth);
                if (!req.auth?.id) {
                    return ReturnHelper.errorResponse(res, 403, 666, Language.lang.failed_access);
                }

                return next();
            }
        )

        app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
            if (err.name === 'UnauthorizedError') {
                return ReturnHelper.errorResponse(res, 403, 666, Language.lang.failed_access);
            }

            return next();
        });

    }

    static signToken = (payload: any, expiresIn: any): string | null => {
        try {
            var privateKey = fs.readFileSync("src/helpers/key/private.key");

            // Menentukan opsi untuk token (seperti masa berlaku token)
            const options: jwt.SignOptions = {
                expiresIn: expiresIn,  // Token akan kedaluwarsa dalam 1 jam
            };

            // Menandatangani token menggunakan private key dan RS256
            const token = jwt.sign(payload, privateKey, {
                algorithm: 'RS256',  // Menggunakan algoritma RS256 untuk tanda tangan
                ...options,  // Menambahkan opsi seperti masa berlaku
            });

            // Mengirimkan token sebagai respons
            return token
        } catch (error) {
            console.error('Error while signing token:', error);
            return null
        }
    };

    static verifyToken = (token: string): any => {
        try {
            // Reading the public key for verification
            var publicKey = fs.readFileSync("src/helpers/key/public.key");

            // Verify the token using the public key and RS256 algorithm
            const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });

            return decoded;  // Return the decoded payload if the token is valid
        } catch (error) {
            console.error('Error while verifying token:', error);
            return null;  // Return null if the token is invalid or expired
        }
    };
}