import type { GraphQLFormattedError } from 'graphql';

/** O Nest só mapeia alguns status HTTP para `extensions.code`; completamos os demais. */
const CODE_BY_STATUS: Record<number, string> = {
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'UNPROCESSABLE_ENTITY',
  429: 'TOO_MANY_REQUESTS',
  503: 'SERVICE_UNAVAILABLE',
};

/**
 * - Padroniza os códigos de erro para o cliente.
 * - Fora de development/test, erros inesperados (ex.: falha de SQL) não vazam a mensagem original.
 */
export function buildFormatError(exposed: boolean) {
  return (formatted: GraphQLFormattedError, error: unknown): GraphQLFormattedError => {
    // Sem instanceof: funciona mesmo com mais de uma cópia do pacote `graphql` instalada.
    const original = ((error as { originalError?: unknown } | undefined)?.originalError ??
      error) as {
      getStatus?: () => number;
    };
    const status = typeof original.getStatus === 'function' ? original.getStatus() : undefined;
    const mapped = status !== undefined ? CODE_BY_STATUS[status] : undefined;

    if (mapped && formatted.extensions?.code === 'INTERNAL_SERVER_ERROR') {
      return { ...formatted, extensions: { ...formatted.extensions, code: mapped } };
    }
    if (!exposed && formatted.extensions?.code === 'INTERNAL_SERVER_ERROR') {
      return { ...formatted, message: 'Internal server error' };
    }
    return formatted;
  };
}
