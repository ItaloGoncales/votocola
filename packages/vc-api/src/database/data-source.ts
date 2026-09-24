import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { loadEnv } from '../config/load-env.js';
import { buildCliDataSourceOptions } from './database.config.js';

loadEnv();

/** Entry point da CLI do TypeORM (migration:run, migration:generate, ...). */
export default new DataSource(buildCliDataSourceOptions());
