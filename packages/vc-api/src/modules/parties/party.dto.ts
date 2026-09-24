import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PoliticalPosition } from '../../graphql/enums.js';

@ObjectType('Party')
export class PartyDto {
  @Field(() => Int, { description: 'Número do partido na urna' })
  number!: number;

  @Field(() => String)
  acronym!: string;

  @Field(() => String)
  name!: string;

  @Field(() => PoliticalPosition, { nullable: true })
  position!: PoliticalPosition | null;

  @Field(() => String, { nullable: true, description: 'Rótulo em pt-BR da posição' })
  positionLabel!: string | null;

  @Field(() => String, { nullable: true })
  federationAcronym!: string | null;

  @Field(() => String, { nullable: true })
  federationName!: string | null;
}
