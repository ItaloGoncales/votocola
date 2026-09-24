import { registerEnumType } from '@nestjs/graphql';
import { Office } from '../domain/offices.js';
import { PoliticalPosition } from '../domain/positions.js';
import { InteractionKind } from '../modules/candidates/interactions.service.js';

/** Ordem da busca. POPULAR usa visualizações e escolhas (uma vez por aparelho). */
export enum CandidateSort {
  POPULAR = 'POPULAR',
  NAME = 'NAME',
}

registerEnumType(Office, { name: 'Office', description: 'Cargo em disputa' });
registerEnumType(PoliticalPosition, {
  name: 'PoliticalPosition',
  description: 'Espectro político',
});
registerEnumType(CandidateSort, { name: 'CandidateSort' });
registerEnumType(InteractionKind, { name: 'InteractionKind' });

export { InteractionKind, Office, PoliticalPosition };
