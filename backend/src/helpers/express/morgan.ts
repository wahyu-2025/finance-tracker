import config from 'config';
import morgan from 'morgan';
import express from 'express';

export class MorganHelper {
    static setup(app: express.Application) {
        if (process.env.NODE_ENV == 'prod') {
            app.use(morgan(config.get('server.morgan'), {
                skip: function (req, res) { return res.statusCode < 400 }
            }));
        } else {
            app.use(morgan(config.get('server.morgan')));
        }
    }
}