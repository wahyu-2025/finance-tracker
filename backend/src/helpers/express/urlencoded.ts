import config from 'config';
import express from 'express';

export class UrlencodedHelper {
    static setup(app: express.Application) {
        app.use(
            express.urlencoded({
                extended: true,
                limit: config.get('server.max_body'),
            })
        );
    }
}