import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Party } from '../../database/entities/index.js';
import { PartiesResolver } from './parties.resolver.js';
import { PartiesService } from './parties.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Party])],
  providers: [PartiesService, PartiesResolver],
})
export class PartiesModule {}
