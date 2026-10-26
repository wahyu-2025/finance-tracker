import express from 'express';

export class JsonHelper {
    static setup(app: express.Application) {
        app.use(
            express.json({
                limit: process.env.MAX_BODY || '50mb',
            })
        );
    }
}