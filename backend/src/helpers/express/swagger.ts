import config from 'config';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../../swagger/swagger.json';

export class SwaggerHelper {
    static setup(app: express.Application) {
        var options = {
            explorer: false,
        };

        app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));
    }
}