import { existsSync } from 'node:fs';

/** Carrega o `.env` (do pacote ou da raiz do monorepo) em scripts fora do Nest (CLI, importação). */
export function loadEnv(): void {
  for (const file of ['.env', '../../.env']) {
    if (existsSync(file)) process.loadEnvFile(file);
  }
}
