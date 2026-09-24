import { ArgsType, Field, ID } from '@nestjs/graphql';
import { IsEnum, IsUUID } from 'class-validator';
import { InteractionKind } from '../interactions.service.js';

/** Sem identificador de aparelho: o servidor guarda só totais por candidato. */
@ArgsType()
export class TrackArgs {
  @Field(() => ID)
  @IsUUID()
  candidateId!: string;

  @Field(() => InteractionKind)
  @IsEnum(InteractionKind)
  kind!: InteractionKind;
}
