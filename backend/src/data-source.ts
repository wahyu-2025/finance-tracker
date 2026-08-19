import 'dotenv/config';
import { DataSource } from "typeorm";
import { entities } from "./entities/index";

const engine = (process.env.DB_ENGINE || 'mysql') as 'mysql' | 'postgres'

export const AppDataSource = new DataSource({
    type: engine,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: false,
    logging: process.env.DB_LOGGING === 'true',
    entities: entities,
    subscribers: [],
    migrations: ["src/migrations/*.ts"],
    ssl: process.env.DB_SSL_ENABLE === 'true' ? {
        rejectUnauthorized: false
    } : undefined,
    extra: {
        connectTimeout: 30000,
    },
})