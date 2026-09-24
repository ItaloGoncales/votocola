import { Field, InputType, Int } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { NATIONAL, STATES } from '../../../domain/offices.js';
import { Office, PoliticalPosition } from '../../../graphql/enums.js';

const upper = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;

@InputType()
export class CandidateFilterInput {
  @Field(() => String, {
    nullable: true,
    description:
      'UF do eleitor: traz os candidatos da UF e os de presidente. Omitido = todo o país',
  })
  @IsOptional()
  @Transform(upper)
  @IsIn([...STATES, NATIONAL])
  state?: string;

  @Field(() => Office, { nullable: true })
  @IsOptional()
  @IsEnum(Office)
  office?: Office;

  @Field(() => String, { nullable: true, description: 'Nome, número ou sigla do partido' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  query?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  partyNumber?: number;

  @Field(() => [PoliticalPosition], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(PoliticalPosition, { each: true })
  positions?: PoliticalPosition[];

  @Field(() => [String], { nullable: true, description: 'Slugs; o candidato precisa ter todos' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  attributes?: string[];

  @Field(() => Boolean, { defaultValue: false, description: 'Inclui quem saiu da disputa' })
  @IsOptional()
  @IsBoolean()
  includeInactive?: boolean;
}
