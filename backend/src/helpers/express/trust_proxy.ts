import express from 'express';

export class TrustProxyHelper {
    static setup(app: express.Application) {
        app.set('trust proxy', true);
    }
}