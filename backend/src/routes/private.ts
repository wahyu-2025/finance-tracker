import express from 'express';
import { Language } from '../langs/lang';
import JwtHelper from '../helpers/jwt';
import guardPre from 'express-jwt-permissions';
import { AuthController } from '../controllers/auth';
import { CategoryController } from '../controllers/category';
import { TransactionController } from '../controllers/transaction';

const guard = guardPre({
    requestProperty: 'auth',
    permissionsProperty: 'data.type',
});

export class RoutePrivate {
    static setup(app: express.Application) {

        app.use(Language.apply)

        JwtHelper.secure(app);

        app.post('/api/auth/profile',  AuthController.getProfile)
        app.post('/api/auth/update-profile', AuthController.updateProfile)
        
        // Category Routes
        app.post('/api/category', CategoryController.create)
        app.get('/api/category', CategoryController.getAll)
        app.put('/api/category/:id', CategoryController.update)
        app.delete('/api/category/:id', CategoryController.delete)

        // Transaction Routes
        app.post('/api/transaction', TransactionController.create)
        app.put('/api/transaction/:id', TransactionController.update)
        app.delete('/api/transaction/:id', TransactionController.delete)
        app.get('/api/transaction/history', TransactionController.getHistory)
    }
}