import { Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attribute } from '../../database/entities/index.js';
import { AttributeDto } from './attribute.dto.js';

@Resolver(() => AttributeDto)
export class AttributesResolver {
  constructor(@InjectRepository(Attribute) private readonly repo: Repository<Attribute>) {}

  /** Só atributos com algum candidato: um filtro que sempre volta vazio (ex.: reeleição antes de o TSE publicar) não aparece. */
  @Query(() => [AttributeDto], { description: 'Atributos disponíveis como filtro' })
  attributes(): Promise<AttributeDto[]> {
    return this.repo
      .createQueryBuilder('a')
      .where('EXISTS (SELECT 1 FROM candidate_attributes ca WHERE ca.attribute_id = a.id)')
      .orderBy('a.sortOrder', 'ASC')
      .addOrderBy('a.name', 'ASC')
      .getMany();
  }
}
