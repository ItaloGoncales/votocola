import { trackCandidate } from '@/api';
import { store } from '@/store';

/** Conta visualização/escolha uma única vez por candidato neste aparelho. */
export function countOnce(kind: 'VIEW' | 'PICK', candidateId: string) {
  if (store.markCounted(kind, candidateId)) trackCandidate(candidateId, kind);
}
