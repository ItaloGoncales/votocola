import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidate, CandidateHistory } from '../../database/entities/index.js';
import { CandidatesResolver } from './candidates.resolver.js';
import { CandidatesService } from './candidates.service.js';
import { InteractionsService } from './interactions.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Candidate, CandidateHistory])],
  providers: [CandidatesService, InteractionsService, CandidatesResolver],
})
export class CandidatesModule {}
