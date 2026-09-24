import { PoliticalPosition } from '../domain/positions.js';
import { normalizeText } from '../domain/text.js';

const { LEFT, CENTER_LEFT, CENTER, CENTER_RIGHT, RIGHT } = PoliticalPosition;

/**
 * Posição política padrão por sigla. EDITORIAL (não vem do TSE): revise antes de publicar.
 * Só é aplicada a partidos ainda sem posição, então ajustes feitos no banco são preservados
 * (use `import:tse partidos --force` para reaplicar).
 */
const BY_ACRONYM: Record<string, PoliticalPosition> = {
  pt: LEFT,
  psol: LEFT,
  pcdob: LEFT,
  pcb: LEFT,
  pco: LEFT,
  pstu: LEFT,
  up: LEFT,
  psb: CENTER_LEFT,
  pdt: CENTER_LEFT,
  pv: CENTER_LEFT,
  rede: CENTER_LEFT,
  solidariedade: CENTER_LEFT,
  mdb: CENTER,
  psd: CENTER,
  cidadania: CENTER,
  avante: CENTER,
  mobiliza: CENTER,
  pmb: CENTER,
  psdb: CENTER_RIGHT,
  podemos: CENTER_RIGHT,
  pode: CENTER_RIGHT,
  uniao: CENTER_RIGHT,
  pp: CENTER_RIGHT,
  prd: CENTER_RIGHT,
  agir: CENTER_RIGHT,
  pl: RIGHT,
  novo: RIGHT,
  republicanos: RIGHT,
  dc: RIGHT,
  missao: RIGHT,
  prtb: RIGHT,
};

export const positionForParty = (acronym: string): PoliticalPosition | null =>
  BY_ACRONYM[normalizeText(acronym).replace(/[^a-z]/g, '')] ?? null;

/**
 * Exceções por candidato (`SQ_CANDIDATO` -> posição), para quem destoa do partido ou é de
 * partido sem posição. Também editorial e aplicada só a quem ainda não tem posição própria.
 */
export const CANDIDATE_POSITIONS: Record<string, PoliticalPosition> = {
  '70002546972': CENTER, // Jorge Vianna (DEMOCRATA, dep. distrital DF)
};
