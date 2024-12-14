import 'dotenv/config';
import "reflect-metadata";
import { DataSource } from "typeorm";
import path from 'path';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgrespassword",
  database: process.env.DB_NAME || "postgres",
  entities: [
    !isProduction && path.join(__dirname, '..', 'entities', '*.ts'),
    isProduction && path.join(__dirname, '..', 'entities', '*.js'),
  ].filter(Boolean) as string[],

  migrations: [
    !isProduction && path.join(__dirname, 'migrations', '*.ts'),
    isProduction && path.join(__dirname, 'migrations', '*.js'),
  ].filter(Boolean) as string[],
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: false,
});