import type { BallotSlot } from '@/api';
import { checkAdd, slotsFor, type Pick } from '@/domain/colinha';

const ballot: BallotSlot[] = [
  { key: 'FEDERAL_DEPUTY', office: 'FEDERAL_DEPUTY', label: 'Deputado(a) federal', digits: 4 },
  { key: 'SENATOR_1', office: 'SENATOR', label: 'Senador(a) — 1ª vaga', digits: 3 },
  { key: 'SENATOR_2', office: 'SENATOR', label: 'Senador(a) — 2ª vaga', digits: 3 },
  { key: 'PRESIDENT', office: 'PRESIDENT', label: 'Presidente', digits: 2 },
];
const pick = (over: Partial<Pick>): Pick => ({
  id: '1',
  number: '555',
  ballotName: 'Fulano',
  partyAcronym: 'X',
  photoUrl: null,
  state: 'SP',
  office: 'SENATOR',
  ...over,
});

describe('checkAdd', () => {
  it('blocks candidates from another state', () => {
    const result = checkAdd(pick({ state: 'RJ' }), ballot[1], 'SP', {}, ballot);
    expect(result).toMatchObject({ ok: false, title: 'Candidato de outro estado' });
  });

  it('allows president from any state', () => {
    const president = pick({ state: 'BR', office: 'PRESIDENT', number: '13' });
    expect(checkAdd(president, ballot[3], 'AM', {}, ballot)).toEqual({ ok: true });
  });

  it('blocks the same senator in both seats', () => {
    const senator = pick({});
    const result = checkAdd(senator, ballot[2], 'SP', { SENATOR_1: senator }, ballot);
    expect(result).toMatchObject({ ok: false, title: 'Candidato repetido' });
  });

  it('blocks a different office', () => {
    expect(checkAdd(pick({}), ballot[0], 'SP', {}, ballot)).toMatchObject({ ok: false });
  });
});

describe('slotsFor', () => {
  it('lists empty senate seats first', () => {
    const slots = slotsFor(pick({}), ballot, { SENATOR_1: pick({ id: '2' }) });
    expect(slots.map((s) => s.key)).toEqual(['SENATOR_2', 'SENATOR_1']);
  });
});
