import { countdownLabel, daysUntilElection } from '@/domain/election';

describe('election countdown', () => {
  it('counts calendar days in local time', () => {
    expect(daysUntilElection(new Date(2026, 8, 23, 23, 59))).toBe(11);
    expect(countdownLabel(new Date(2026, 8, 23, 8, 0))).toBe('Faltam 11 dias para a eleição');
    expect(countdownLabel(new Date(2026, 9, 3, 12, 0))).toBe('A eleição é amanhã!');
    expect(countdownLabel(new Date(2026, 9, 4, 7, 0))).toBe('A eleição é hoje!');
    expect(countdownLabel(new Date(2026, 9, 5))).toBeNull();
  });
});
