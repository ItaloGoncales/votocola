import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { buildCorsOptions } from './config/cors.js';

/** Fotos e planos de governo importados do TSE (ver `src/import`). */
export const STORAGE_DIR = join(process.cwd(), 'storage');
export const PHOTOS_DIR = join(STORAGE_DIR, 'fotos');
export const PLANS_DIR = join(STORAGE_DIR, 'planos');

/**
 * `TRUST_PROXY`: atrás de um proxy (Fly.io, Caddy...), o IP do cliente vem em X-Forwarded-For.
 * Sem isso, o rate limit veria todo mundo com o IP do proxy e bloquearia usuários reais.
 * Aceita um número de saltos (ex.: 1), "true" ou vazio (desligado, acesso direto).
 */
export function parseTrustProxy(value: string | undefined): number | boolean | undefined {
  if (!value) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return undefined;
  const hops = Number(value);
  if (!Number.isInteger(hops) || hops < 0)
    throw new Error('TRUST_PROXY deve ser um inteiro ou "true"');
  return hops;
}

/** Configuração HTTP compartilhada entre `main.ts` e os testes. */
export function configureApp(
  app: NestExpressApplication,
  env: NodeJS.ProcessEnv = process.env,
): void {
  const trustProxy = parseTrustProxy(env.TRUST_PROXY);
  if (trustProxy !== undefined) app.set('trust proxy', trustProxy);
  app.enableCors(buildCorsOptions(env));
  // Em produção o ideal é um CDN/bucket na frente; aqui o próprio Express serve os arquivos.
  app.useStaticAssets(PHOTOS_DIR, { prefix: '/fotos/', maxAge: '7d', fallthrough: false });
  app.useStaticAssets(PLANS_DIR, { prefix: '/planos/', maxAge: '1d', fallthrough: false });
}
