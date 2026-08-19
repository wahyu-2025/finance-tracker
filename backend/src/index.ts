import 'dotenv/config';
import { Logger, ILogObj } from "tslog";
import { app } from "./server";
import config from 'config'
import https from 'https';
import fs from 'fs';
import 'source-map-support/register';
import { setDefaultResultOrder } from 'node:dns';
setDefaultResultOrder('ipv4first');


const log: Logger<ILogObj> = new Logger({ name: '[Index]', type: 'pretty' });

const HOST = process.env.HOST || config.get('server.host')
const PORT = Number(process.env.PORT || config.get('server.port'))

const server = app.listen(config.get('server.ssl.enable') ? PORT + 1000 : PORT, String(HOST), () => {
    log.info(`Server ${process.env.APP_NAME || config.get('app.name')} running on port http://${HOST}:${PORT}`);
});

if (config.get('server.ssl.enable')) {
    const options = {
        cert: fs.readFileSync(config.get('server.ssl.cert')),
        key: fs.readFileSync(config.get('server.ssl.key'))
    };

    https.createServer(options, app).listen(PORT);
}

const onCloseSignal = () => {
    log.info("sigint received, shutting down");
    server.close(() => {
        log.info("server closed");
        process.exit();
    });
    setTimeout(() => process.exit(1), 10000).unref(); // Force shutdown after 10s
};

process.on("SIGINT", onCloseSignal);
process.on("SIGTERM", onCloseSignal);