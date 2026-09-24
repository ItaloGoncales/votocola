export interface Env {
  /** URL pública da API, base das URLs de fotos e planos de governo. */
  PUBLIC_URL: string;
  /** Origens permitidas no CORS, separadas por vírgula. Padrão: qualquer `http://localhost:<porta>`. */
  CORS_ORIGINS?: string;
  /**
   * Ordena a busca por popularidade (visualizações e escolhas). Padrão: true. Desligue com
   * `POPULARITY_SORT=false` se houver dúvida jurídica (vedação a enquetes no período eleitoral).
   */
  POPULARITY_SORT: boolean;
  /** Mostra no app o número de visualizações do perfil. Padrão: true. */
  VIEW_COUNT_VISIBLE: boolean;
}

/** Liga/desliga opcional, ligado por padrão; aceita só "true"/"false". */
function flag(config: Record<string, unknown>, name: string): boolean {
  const value = config[name];
  if (value === undefined || value === '' || value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  throw new Error(`${name} deve ser "true" ou "false"`);
}

/** Falha o boot da API cedo caso a configuração esteja inválida. */
export function validateEnv(config: Record<string, unknown>): Record<string, unknown> & Env {
  const raw =
    typeof config.PUBLIC_URL === 'string' && config.PUBLIC_URL !== ''
      ? config.PUBLIC_URL
      : undefined;
  const publicUrl =
    raw ?? `http://localhost:${typeof config.PORT === 'string' ? config.PORT : 4000}`;
  if (!/^https?:\/\/[^/]+/.test(publicUrl)) {
    throw new Error('PUBLIC_URL deve ser uma URL http(s), ex.: https://api.votocola.app');
  }
  return {
    ...config,
    PUBLIC_URL: publicUrl.replace(/\/+$/, ''),
    POPULARITY_SORT: flag(config, 'POPULARITY_SORT'),
    VIEW_COUNT_VISIBLE: flag(config, 'VIEW_COUNT_VISIBLE'),
  };
}
