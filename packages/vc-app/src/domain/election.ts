/** 1º turno de 2026 (data local). */
export const ELECTION_DAY = { year: 2026, month: 10, day: 4 } as const;

/** Dias inteiros até a eleição no calendário local do aparelho (negativo depois dela). */
export function daysUntilElection(now = new Date()): number {
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const election = Date.UTC(ELECTION_DAY.year, ELECTION_DAY.month - 1, ELECTION_DAY.day);
  return Math.round((election - today) / 86_400_000);
}

/** "Faltam 11 dias para a eleição", "É amanhã!", "É hoje!"; null depois do 1º turno. */
export function countdownLabel(now = new Date()): string | null {
  const days = daysUntilElection(now);
  if (days < 0) return null;
  if (days === 0) return 'A eleição é hoje!';
  if (days === 1) return 'A eleição é amanhã!';
  return `Faltam ${days} dias para a eleição`;
}
