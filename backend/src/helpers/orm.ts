import { DataSource } from "typeorm";
import { ILogObj, Logger } from 'tslog';
import { entities } from "../entities/index";

export class OrmHelper {
    static DB: DataSource = null

    static setup() {
        const log: Logger<ILogObj> = new Logger({ name: '[OrmHelper]', type: 'pretty' });

        const engine = (process.env.DB_ENGINE || 'mysql') as 'mysql' | 'postgres'

        OrmHelper.DB = new DataSource({
            type: engine,
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            synchronize: process.env.DB_SYNC === 'true',
            logging: process.env.DB_LOGGING === 'true',
            entities: entities,
            subscribers: [],
            migrations: [],
            ssl: process.env.DB_SSL_ENABLE === 'true' ? {
                rejectUnauthorized: false
            } : undefined,
            extra: {
                connectTimeout: 30000,
            },
        })

        OrmHelper.DB.initialize()
            .then(() => {
                log.info('Database connected')
            })
            .catch((error: any) => log.error(error))
    }
}