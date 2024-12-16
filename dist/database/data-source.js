"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("dotenv/config");
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const path_1 = __importDefault(require("path"));
const typeorm_naming_strategies_1 = require("typeorm-naming-strategies");
const isProduction = process.env.NODE_ENV === 'production';
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgrespassword",
    database: process.env.DB_NAME || "postgres",
    entities: [
        !isProduction && path_1.default.join(__dirname, '..', 'entities', '*.ts'),
        isProduction && path_1.default.join(__dirname, '..', 'entities', '*.js'),
    ].filter(Boolean),
    migrations: [
        !isProduction && path_1.default.join(__dirname, 'migrations', '*.ts'),
        isProduction && path_1.default.join(__dirname, 'migrations', '*.js'),
    ].filter(Boolean),
    namingStrategy: new typeorm_naming_strategies_1.SnakeNamingStrategy(),
    synchronize: false,
});
