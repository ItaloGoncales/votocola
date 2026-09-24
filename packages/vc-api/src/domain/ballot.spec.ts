import { ballotFor } from './ballot.js';
import { Office } from './offices.js';

describe('ballotFor', () => {
  it('follows the 2026 voting order with two senate seats', () => {
    expect(ballotFor('SP').map((s) => s.key)).toEqual([
      'FEDERAL_DEPUTY',
      'STATE_DEPUTY',
      'SENATOR_1',
      'SENATOR_2',
      'GOVERNOR',
      'PRESIDENT',
    ]);
  });

  it('uses district deputy in DF', () => {
    expect(ballotFor('DF')[1]).toMatchObject({ office: Office.DISTRICT_DEPUTY, digits: 5 });
  });
});
