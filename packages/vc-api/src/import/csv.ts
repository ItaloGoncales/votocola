/** Marcadores de "sem informação" usados nos arquivos do TSE (comparados em maiúsculas). */
const NULLS = new Set([
  '',
  '#NULO#',
  '#NULO',
  '#NE#',
  '#NE',
  '-1',
  '-3',
  '-4',
  'NÃO DIVULGÁVEL',
  'NÃO INFORMADA',
  'NÃO INFORMADO',
]);

export const clean = (value: string | undefined): string | null =>
  value === undefined || NULLS.has(value.trim().toUpperCase()) ? null : value.trim();

/**
 * Lê um CSV do TSE (`;` como separador, campos entre aspas, `""` como aspas escapadas). Os
 * arquivos vêm em Latin-1; `decode` converte antes. Devolve um objeto por linha, pelo cabeçalho.
 */
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ';') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else field += ch;
  }
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }

  const [header, ...data] = rows;
  if (!header) return [];
  const keys = header.map((h) => h.trim().replace(/^﻿/, ''));
  return data.map((cells) => Object.fromEntries(keys.map((k, i) => [k, cells[i] ?? ''])));
}

/** Arquivos do TSE vêm em Latin-1; se o arquivo já for UTF-8 válido, mantém. */
export function decode(buffer: Buffer): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder('latin1').decode(buffer);
  }
}

const LOWER_WORDS = new Set(['da', 'das', 'de', 'do', 'dos', 'e']);

/** `JOSÉ DA SILVA` -> `José da Silva`. Nomes chegam do TSE em maiúsculas. */
export const titleCase = (value: string): string =>
  value
    .toLowerCase()
    .replace(/\p{L}+/gu, (word, offset: number) =>
      offset > 0 && LOWER_WORDS.has(word) ? word : word.charAt(0).toUpperCase() + word.slice(1),
    );

/** `31/12/1970` -> `1970-12-31`. */
export function parseDate(value: string | null): string | null {
  const m = value?.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}
