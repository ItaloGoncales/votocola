import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Party } from '../../database/entities/index.js';
import { POSITION_LABELS } from '../../domain/positions.js';
import type { PartyDto } from './party.dto.js';

export const toPartyDto = (party: Party): PartyDto => ({
  number: party.number,
  acronym: party.acronym,
  name: party.name,
  position: party.position,
  positionLabel: party.position ? POSITION_LABELS[party.position] : null,
  federationAcronym: party.federationAcronym,
  federationName: party.federationName,
});

@Injectable()
export class PartiesService {
  constructor(@InjectRepository(Party) private readonly parties: Repository<Party>) {}

  async list(): Promise<PartyDto[]> {
    const rows = await this.parties.find({ order: { acronym: 'ASC' } });
    return rows.map(toPartyDto);
  }
}
