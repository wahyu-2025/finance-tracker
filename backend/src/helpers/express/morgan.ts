import morgan from 'morgan';
import express from 'express';

export class MorganHelper {
    static setup(app: express.Application) {
        const morganFormat = process.env.MORGAN_FORMAT || 'combined';
        if (process.env.NODE_ENV == 'prod') {
            app.use(morgan(morganFormat, {
                skip: function (req, res) { return res.statusCode < 400 }
            }));
        } else {
            app.use(morgan(morganFormat));
        }
    }
}