import express from 'express';

export class UrlencodedHelper {
    static setup(app: express.Application) {
        app.use(
            express.urlencoded({
                extended: true,
                limit: process.env.MAX_BODY || '50mb',
            })
        );
    }
}