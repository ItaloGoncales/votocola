/** Minúsculas, sem acentos e com espaços simples: base da busca por nome. */
export const normalizeText = (value: string): string =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

/** Termos da busca, já normalizados. */
export const searchTerms = (query: string | undefined): string[] =>
  normalizeText(query ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 6);
