import type { Candidate, CandidateHistory } from '../../database/entities/index.js';
import { OFFICE_LABELS } from '../../domain/offices.js';
import { POSITION_LABELS } from '../../domain/positions.js';
import { toPartyDto } from '../parties/parties.service.js';
import type { CandidateDto, ElectionHistoryDto } from './dtos/candidate.dto.js';

/** Dia do 1º turno de 2026: referência para a idade. */
export const ELECTION_DAY = '2026-10-04';

export function ageOn(birthDate: string | null, day = ELECTION_DAY): number | null {
  if (!birthDate) return null;
  const [by, bm, bd] = birthDate.split('-').map(Number);
  const [y, m, d] = day.split('-').map(Number);
  return y - by - (m < bm || (m === bm && d < bd) ? 1 : 0);
}

const oneDecimal = (n: number) => n.toFixed(1).replace(/\.0$/, '').replace('.', ',');

/** Número compacto em pt-BR: 999, 1,2 mil, 12 mil, 3,4 mi. */
export function compactCount(n: number): string {
  if (n < 1_000) return String(n);
  if (n < 1_000_000) return `${n < 10_000 ? oneDecimal(n / 1_000) : Math.floor(n / 1_000)} mil`;
  return `${oneDecimal(n / 1_000_000)} mi`;
}

export interface MapperOptions {
  publicUrl: string;
  /** VIEW_COUNT_VISIBLE: sem ele, viewCount/viewCountLabel saem nulos. */
  showViews: boolean;
}

export function toCandidateDto(
  c: Candidate,
  { publicUrl, showViews }: MapperOptions,
): CandidateDto {
  const position = c.position ?? c.party.position;
  return {
    id: c.id,
    tseId: c.tseId,
    state: c.state,
    office: c.office,
    officeLabel: OFFICE_LABELS[c.office],
    number: c.number,
    ballotName: c.ballotName,
    fullName: c.fullName,
    party: toPartyDto(c.party),
    coalitionName: c.coalitionName,
    coalitionParties: c.coalitionParties,
    position,
    positionLabel: position ? POSITION_LABELS[position] : null,
    gender: c.gender,
    raceColor: c.raceColor,
    birthDate: c.birthDate,
    age: ageOn(c.birthDate),
    education: c.education,
    occupation: c.occupation,
    reelection: c.reelection,
    status: c.status,
    statusDetail: c.statusDetail,
    active: c.active,
    photoUrl: c.hasPhoto ? `${publicUrl}/fotos/${c.tseId}.jpg` : null,
    planUrl: c.planFile ? `${publicUrl}/planos/${encodeURIComponent(c.planFile)}` : null,
    planSummary: c.planSummary,
    attributes: (c.attributes ?? [])
      .toSorted((a, b) => a.sortOrder - b.sortOrder)
      .map(({ slug, name, group }) => ({ slug, name, group })),
    socialLinks: c.socialLinks ?? [],
    history: [],
    viewCount: showViews ? c.viewCount : null,
    viewCountLabel: showViews ? compactCount(c.viewCount) : null,
  };
}

const MUNICIPAL_OFFICES = ['prefeito', 'vice-prefeito', 'vereador'];

/** Onde foi a eleição: "Teresina (PI)" para cargos municipais, a UF para os demais, "Brasil" para presidente. */
export function historyPlace(
  office: string,
  place: string | null,
  state: string | null,
): string | null {
  if (MUNICIPAL_OFFICES.includes(office.toLowerCase()))
    return place && state ? `${place} (${state})` : place;
  if (!state || state === 'BR') return place ?? state;
  return state;
}

export function toHistoryDto(h: CandidateHistory): ElectionHistoryDto {
  return {
    year: h.electionYear,
    office: h.office,
    place: historyPlace(h.office, h.place, h.state),
    party: h.party,
    result: h.result,
    elected: h.elected,
  };
}
