import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { buildCorsOptions } from './config/cors.js';

/** Fotos e planos de governo importados do TSE (ver `src/import`). */
export const STORAGE_DIR = join(process.cwd(), 'storage');
export const PHOTOS_DIR = join(STORAGE_DIR, 'fotos');
export const PLANS_DIR = join(STORAGE_DIR, 'planos');

/** Configuração HTTP compartilhada entre `main.ts` e os testes. */
export function configureApp(
  app: NestExpressApplication,
  env: NodeJS.ProcessEnv = process.env,
): void {
  app.enableCors(buildCorsOptions(env));
  // Em produção o ideal é um CDN/bucket na frente; aqui o próprio Express serve os arquivos.
  app.useStaticAssets(PHOTOS_DIR, { prefix: '/fotos/', maxAge: '7d', fallthrough: false });
  app.useStaticAssets(PLANS_DIR, { prefix: '/planos/', maxAge: '1d', fallthrough: false });
}
