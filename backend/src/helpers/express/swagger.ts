import config from 'config';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../../swagger/swagger.json';

export class SwaggerHelper {
    static setup(app: express.Application) {
        var options = {
            explorer: false,
        };

        // Dynamically override the server URL at runtime
        swaggerDocument.servers = [
            {
                url: config.get<string>('server.host_swagger'),
                description: 'Environment ' + config.get<string>('app.env')
            }
        ];

        app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));
    }
}