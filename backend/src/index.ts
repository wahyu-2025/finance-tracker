import 'dotenv/config';
import { Logger, ILogObj } from "tslog";
import { app } from "./server";
import https from 'https';
import fs from 'fs';
import 'source-map-support/register';
import { setDefaultResultOrder } from 'node:dns';
setDefaultResultOrder('ipv4first');

const log: Logger<ILogObj> = new Logger({ name: '[Index]', type: 'pretty' });

const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT || 5000);
const sslEnable = process.env.SSL_ENABLE === 'true';

const server = app.listen(sslEnable ? PORT + 1000 : PORT, String(HOST), () => {
    log.info(`Server ${process.env.APP_NAME || 'Backend'} running on port http://${HOST}:${PORT}`);
});

if (sslEnable) {
    const options = {
        cert: fs.readFileSync(process.env.SSL_CERT || ''),
        key: fs.readFileSync(process.env.SSL_KEY || '')
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