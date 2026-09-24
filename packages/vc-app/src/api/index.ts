import { gql } from './client';
import type { Attribute, BallotSlot, Candidate, CandidateFilter, CandidateSummary } from './types';

export { GraphQLRequestError } from './client';
export type * from './types';

const SUMMARY = `id state office officeLabel number ballotName party { acronym }
  position positionLabel photoUrl reelection viewCount viewCountLabel`;

export const fetchBallot = async (state: string) =>
  (
    await gql<{ ballot: BallotSlot[] }>(
      'query($state: String!) { ballot(state: $state) { key office label digits } }',
      { state },
    )
  ).ballot;

export interface CandidatePage {
  items: CandidateSummary[];
  total: number;
  hasMore: boolean;
  /** offset da próxima página; null no fim. */
  nextOffset: number | null;
}

export const PAGE_SIZE = 20;

export const searchCandidates = async (filter: CandidateFilter, offset = 0, limit = PAGE_SIZE) =>
  (
    await gql<{ candidates: CandidatePage }>(
      `query($filter: CandidateFilterInput, $limit: Int, $offset: Int) {
        candidates(filter: $filter, limit: $limit, offset: $offset) {
          total hasMore nextOffset items { ${SUMMARY} }
        }
      }`,
      { filter, limit, offset },
    )
  ).candidates;

export const fetchCandidate = async (id: string) =>
  (
    await gql<{ candidate: Candidate }>(
      `query($id: ID!) { candidate(id: $id) {
        ${SUMMARY} fullName coalitionName coalitionParties age gender raceColor education occupation status
        statusDetail active planUrl planSummary
        party { number acronym name federationName } attributes { slug name group } socialLinks { network url }
        history { year office place party result elected }
      } }`,
      { id },
    )
  ).candidate;

/** Soma +1 ao contador do candidato (só totais no servidor). Falhas não afetam o uso do app. */
export function trackCandidate(candidateId: string, kind: 'VIEW' | 'PICK') {
  gql(
    'mutation($candidateId: ID!, $kind: InteractionKind!) { trackCandidate(candidateId: $candidateId, kind: $kind) }',
    {
      candidateId,
      kind,
    },
  ).catch(() => {});
}

export const fetchAttributes = async () =>
  (await gql<{ attributes: Attribute[] }>('{ attributes { slug name group } }')).attributes;
