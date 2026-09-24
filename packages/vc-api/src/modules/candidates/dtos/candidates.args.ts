import { ArgsType, Field } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { PageArgs } from '../../../common/dtos/page.args.js';
import { CandidateSort } from '../../../graphql/enums.js';
import { CandidateFilterInput } from './candidate-filter.js';

/** Paginação + filtro num único ArgsType: o ValidationPipe (whitelist) valida os dois juntos. */
@ArgsType()
export class CandidatesArgs extends PageArgs {
  @Field(() => CandidateFilterInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => CandidateFilterInput)
  filter?: CandidateFilterInput;

  @Field(() => CandidateSort, { defaultValue: CandidateSort.POPULAR })
  @IsEnum(CandidateSort)
  sort: CandidateSort = CandidateSort.POPULAR;
}
