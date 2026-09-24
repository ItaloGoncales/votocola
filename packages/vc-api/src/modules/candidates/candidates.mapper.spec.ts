import { ageOn, compactCount, historyPlace } from './candidates.mapper.js';

describe('historyPlace', () => {
  it('shows city for municipal offices and the state otherwise', () => {
    expect(historyPlace('Vereador', 'Teresina', 'PI')).toBe('Teresina (PI)');
    expect(historyPlace('Deputado Federal', 'São Paulo', 'SP')).toBe('SP');
    expect(historyPlace('Presidente', 'Brasil', 'BR')).toBe('Brasil');
  });
});

describe('compactCount', () => {
  it('formats counts in pt-BR', () => {
    expect(compactCount(0)).toBe('0');
    expect(compactCount(999)).toBe('999');
    expect(compactCount(1_000)).toBe('1 mil');
    expect(compactCount(1_250)).toBe('1,3 mil');
    expect(compactCount(12_900)).toBe('12 mil');
    expect(compactCount(3_400_000)).toBe('3,4 mi');
  });
});

describe('ageOn', () => {
  it('counts completed years on election day', () => {
    expect(ageOn('1980-10-04')).toBe(46);
    expect(ageOn('1980-10-05')).toBe(45);
    expect(ageOn(null)).toBeNull();
  });
});
