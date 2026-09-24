import type { DataSourceOptions } from 'typeorm';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { entities } from './entities/index.js';
import { SnakeNamingStrategy } from './snake-naming.strategy.js';

const here = fileURLToPath(new URL('.', import.meta.url));
// Compilado (dist) só carrega .js; rodando direto do source carrega .ts. Evita pegar .d.ts.
const ext = import.meta.url.endsWith('.ts') ? 'ts' : 'js';

/** Conexão + entities. Usada pela API (Nest); não carrega migrations. */
export function buildDataSourceOptions(env: NodeJS.ProcessEnv = process.env): DataSourceOptions {
  const url = env.DATABASE_URL || undefined;
  return {
    type: 'postgres',
    url,
    host: url ? undefined : (env.DB_HOST ?? 'localhost'),
    port: url ? undefined : Number(env.DB_PORT ?? 5433),
    username: url ? undefined : (env.DB_USER ?? 'votocerto'),
    password: url ? undefined : (env.DB_PASSWORD ?? 'votocerto'),
    database: url ? undefined : (env.DB_NAME ?? 'votocerto'),
    entities,
    namingStrategy: new SnakeNamingStrategy(),
    // Schema é sempre controlado por migrations, nunca por synchronize.
    synchronize: false,
    logging: env.DB_LOGGING === 'true',
  };
}

/** Igual à anterior + migrations (glob). Para a CLI do TypeORM e os scripts de importação. */
export function buildCliDataSourceOptions(env: NodeJS.ProcessEnv = process.env): DataSourceOptions {
  return {
    ...buildDataSourceOptions(env),
    migrations: [join(here, 'migrations', `*.${ext}`)],
    migrationsTableName: 'migrations',
  };
}
