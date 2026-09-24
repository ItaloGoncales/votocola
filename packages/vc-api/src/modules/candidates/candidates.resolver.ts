import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Throttle } from '@nestjs/throttler';
import { CandidatesService } from './candidates.service.js';
import { InteractionsService } from './interactions.service.js';
import { TrackArgs } from './dtos/track.args.js';
import { BallotSlotDto } from './dtos/ballot-slot.dto.js';
import { CandidatesArgs } from './dtos/candidates.args.js';
import { CandidateDto, CandidatePageDto } from './dtos/candidate.dto.js';

@Resolver(() => CandidateDto)
export class CandidatesResolver {
  constructor(
    private readonly candidatesService: CandidatesService,
    private readonly interactions: InteractionsService,
  ) {}

  @Query(() => CandidatePageDto, { description: 'Busca de candidatos, por nome de urna' })
  candidates(@Args() { filter, sort, limit, offset }: CandidatesArgs): Promise<CandidatePageDto> {
    return this.candidatesService.search(filter, { limit, offset }, sort);
  }

  @Query(() => CandidateDto)
  candidate(@Args('id', { type: () => ID }) id: string): Promise<CandidateDto> {
    return this.candidatesService.findById(id);
  }

  /** Soma visualização/escolha (só totais; o app conta 1 vez por candidato). Limite por IP. */
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @Mutation(() => Boolean)
  trackCandidate(@Args() { candidateId, kind }: TrackArgs): Promise<boolean> {
    return this.interactions.track(candidateId, kind);
  }

  @Query(() => [BallotSlotDto], { description: 'Espaços da colinha da UF, na ordem da urna' })
  ballot(@Args('state', { type: () => String }) state: string): BallotSlotDto[] {
    return this.candidatesService.ballot(state);
  }
}
