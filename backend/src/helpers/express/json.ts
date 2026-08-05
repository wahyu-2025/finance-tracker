import config from 'config';
import express from 'express';

export class JsonHelper {
    static setup(app: express.Application) {
        app.use(
            express.json({
                limit: config.get('server.max_body'),
            })
        );
    }
}