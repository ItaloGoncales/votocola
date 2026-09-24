import { Query, Resolver } from '@nestjs/graphql';
import { PartyDto } from './party.dto.js';
import { PartiesService } from './parties.service.js';

@Resolver(() => PartyDto)
export class PartiesResolver {
  constructor(private readonly partiesService: PartiesService) {}

  @Query(() => [PartyDto], { description: 'Partidos com candidatos importados, por sigla' })
  parties(): Promise<PartyDto[]> {
    return this.partiesService.list();
  }
}
