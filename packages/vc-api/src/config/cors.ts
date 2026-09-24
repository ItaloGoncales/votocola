import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface.js';

/** Qualquer porta em localhost (Expo web, Metro, previews). */
const LOCALHOST = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;

export const parseList = (value: string | undefined): string[] =>
  (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

/**
 * CORS com lista de permissão. `CORS_ORIGINS` (origens exatas, separadas por vírgula) substitui o
 * padrão de localhost. O app nativo não manda `Origin`, então CORS não se aplica a ele.
 */
export function buildCorsOptions(env: NodeJS.ProcessEnv = process.env): CorsOptions {
  const allowed = parseList(env.CORS_ORIGINS);
  return {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const ok = allowed.length > 0 ? allowed.includes(origin) : LOCALHOST.test(origin);
      callback(null, ok);
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['content-type', 'apollo-require-preflight'],
    maxAge: 600,
  };
}
