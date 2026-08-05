import express from 'express';

import { Language } from '../langs/lang';
import { AuthController } from '../controllers/auth';

export class RoutePublic {
    static setup(app: express.Application) {

        app.use(Language.apply);

        app.post('/api/auth/register', AuthController.register)
        app.post('/api/auth/login', AuthController.login)
        app.post('/api/auth/refresh_token', AuthController.refreshToken)
        app.post('/api/auth/forgot-password', AuthController.forgotPassword)
        app.post('/api/auth/change-password', AuthController.changePassword)
    }
}
