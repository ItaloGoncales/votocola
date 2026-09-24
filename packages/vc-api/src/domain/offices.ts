/** Cargos disputados em 2026 que entram na colinha. Vices e suplentes não são importados. */
export enum Office {
  PRESIDENT = 'PRESIDENT',
  GOVERNOR = 'GOVERNOR',
  SENATOR = 'SENATOR',
  FEDERAL_DEPUTY = 'FEDERAL_DEPUTY',
  STATE_DEPUTY = 'STATE_DEPUTY',
  /** Só no DF, no lugar de deputado estadual. */
  DISTRICT_DEPUTY = 'DISTRICT_DEPUTY',
}

/** `CD_CARGO` do TSE -> cargo. */
export const OFFICE_BY_TSE_CODE: Record<number, Office> = {
  1: Office.PRESIDENT,
  3: Office.GOVERNOR,
  5: Office.SENATOR,
  6: Office.FEDERAL_DEPUTY,
  7: Office.STATE_DEPUTY,
  8: Office.DISTRICT_DEPUTY,
};

export const OFFICE_LABELS: Record<Office, string> = {
  [Office.PRESIDENT]: 'Presidente',
  [Office.GOVERNOR]: 'Governador(a)',
  [Office.SENATOR]: 'Senador(a)',
  [Office.FEDERAL_DEPUTY]: 'Deputado(a) federal',
  [Office.STATE_DEPUTY]: 'Deputado(a) estadual',
  [Office.DISTRICT_DEPUTY]: 'Deputado(a) distrital',
};

/** Quantidade de dígitos digitados na urna. */
export const OFFICE_DIGITS: Record<Office, number> = {
  [Office.PRESIDENT]: 2,
  [Office.GOVERNOR]: 2,
  [Office.SENATOR]: 3,
  [Office.FEDERAL_DEPUTY]: 4,
  [Office.STATE_DEPUTY]: 5,
  [Office.DISTRICT_DEPUTY]: 5,
};

/** UF usada para candidatos a presidente (votados em todo o país). */
export const NATIONAL = 'BR';

export const STATES = [
  'AC',
  'AL',
  'AM',
  'AP',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MG',
  'MS',
  'MT',
  'PA',
  'PB',
  'PE',
  'PI',
  'PR',
  'RJ',
  'RN',
  'RO',
  'RR',
  'RS',
  'SC',
  'SE',
  'SP',
  'TO',
] as const;
export type State = (typeof STATES)[number];

export const isState = (value: string): value is State =>
  (STATES as readonly string[]).includes(value);
