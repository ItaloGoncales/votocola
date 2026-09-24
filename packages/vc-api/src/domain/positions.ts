/** Espectro político, usado como filtro. Definido por partido e sobrescrevível por candidato. */
export enum PoliticalPosition {
  LEFT = 'LEFT',
  CENTER_LEFT = 'CENTER_LEFT',
  CENTER = 'CENTER',
  CENTER_RIGHT = 'CENTER_RIGHT',
  RIGHT = 'RIGHT',
}

export const POSITION_LABELS: Record<PoliticalPosition, string> = {
  [PoliticalPosition.LEFT]: 'Esquerda',
  [PoliticalPosition.CENTER_LEFT]: 'Centro-esquerda',
  [PoliticalPosition.CENTER]: 'Centro',
  [PoliticalPosition.CENTER_RIGHT]: 'Centro-direita',
  [PoliticalPosition.RIGHT]: 'Direita',
};
