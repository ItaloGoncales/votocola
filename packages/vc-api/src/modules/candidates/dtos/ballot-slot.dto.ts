import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Office } from '../../../graphql/enums.js';

@ObjectType('BallotSlot', { description: 'Um espaço da colinha, na ordem de votação da urna' })
export class BallotSlotDto {
  @Field(() => String, { description: 'Chave estável: FEDERAL_DEPUTY, SENATOR_1, ...' })
  key!: string;

  @Field(() => Office)
  office!: Office;

  @Field(() => String)
  label!: string;

  @Field(() => Int, { description: 'Dígitos do número na urna' })
  digits!: number;
}
