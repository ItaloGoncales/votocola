import { Office, OFFICE_DIGITS, OFFICE_LABELS, type State } from './offices.js';

export interface BallotSlot {
  /** Chave estável do espaço na colinha (o app guarda a escolha por ela). */
  key: string;
  office: Office;
  label: string;
  digits: number;
}

const slot = (key: string, office: Office, label = OFFICE_LABELS[office]): BallotSlot => ({
  key,
  office,
  label,
  digits: OFFICE_DIGITS[office],
});

/**
 * Ordem de votação na urna em 2026: deputado federal, deputado estadual (distrital no DF),
 * senador (1ª vaga), senador (2ª vaga), governador e presidente.
 */
export function ballotFor(state: State): BallotSlot[] {
  const local = state === 'DF' ? Office.DISTRICT_DEPUTY : Office.STATE_DEPUTY;
  return [
    slot('FEDERAL_DEPUTY', Office.FEDERAL_DEPUTY),
    slot(local, local),
    slot('SENATOR_1', Office.SENATOR, 'Senador(a) — 1ª vaga'),
    slot('SENATOR_2', Office.SENATOR, 'Senador(a) — 2ª vaga'),
    slot('GOVERNOR', Office.GOVERNOR),
    slot('PRESIDENT', Office.PRESIDENT),
  ];
}
