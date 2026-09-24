import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attribute } from '../../database/entities/index.js';
import { AttributesResolver } from './attributes.resolver.js';

@Module({
  imports: [TypeOrmModule.forFeature([Attribute])],
  providers: [AttributesResolver],
})
export class AttributesModule {}
