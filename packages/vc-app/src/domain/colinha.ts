import type { BallotSlot, CandidateSummary } from '@/api';
import { NATIONAL, stateName } from './states';

/** O que a colinha guarda de cada escolha: o suficiente para exibir e compartilhar offline. */
export interface Pick {
  id: string;
  number: string;
  ballotName: string;
  partyAcronym: string;
  photoUrl: string | null;
  state: string;
  office: CandidateSummary['office'];
}

export type Picks = Record<string, Pick>;

export const toPick = (c: CandidateSummary): Pick => ({
  id: c.id,
  number: c.number,
  ballotName: c.ballotName,
  partyAcronym: c.party.acronym,
  photoUrl: c.photoUrl,
  state: c.state,
  office: c.office,
});

export const canVoteIn = (candidateState: string, uf: string) =>
  candidateState === NATIONAL || candidateState === uf;

export type AddCheck = { ok: true } | { ok: false; title: string; message: string };

/** Valida se o candidato pode ocupar o espaço da colinha. */
export function checkAdd(
  candidate: Pick,
  slot: BallotSlot,
  uf: string,
  picks: Picks,
  ballot: BallotSlot[],
): AddCheck {
  if (!canVoteIn(candidate.state, uf)) {
    return {
      ok: false,
      title: 'Candidato de outro estado',
      message:
        `${candidate.ballotName} concorre em ${stateName(candidate.state)} e você vota em ` +
        `${stateName(uf)}. A urna só aceita candidatos do seu estado (exceto presidente).`,
    };
  }
  if (candidate.office !== slot.office) {
    return {
      ok: false,
      title: 'Cargo diferente',
      message: `${candidate.ballotName} não concorre a ${slot.label.toLowerCase()}.`,
    };
  }
  const repeated = ballot.find(
    (other) =>
      other.key !== slot.key &&
      other.office === slot.office &&
      picks[other.key]?.id === candidate.id,
  );
  if (repeated) {
    return {
      ok: false,
      title: 'Candidato repetido',
      message: `${candidate.ballotName} já está em "${repeated.label}". Escolha outro nome.`,
    };
  }
  return { ok: true };
}

/** Espaços possíveis para o candidato, com os vazios primeiro (ex.: as duas vagas de senador). */
export function slotsFor(candidate: Pick, ballot: BallotSlot[], picks: Picks): BallotSlot[] {
  return (
    ballot
      .filter((slot) => slot.office === candidate.office)
      // sort (não toSorted): o Hermes não tem os métodos de array do ES2023; filter já copia.
      .sort((a, b) => Number(!!picks[a.key]) - Number(!!picks[b.key]))
  );
}

export const filledCount = (ballot: BallotSlot[], picks: Picks) =>
  ballot.filter((slot) => picks[slot.key]).length;
