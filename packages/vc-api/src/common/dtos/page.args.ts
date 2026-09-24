import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsInt, Max, Min } from 'class-validator';

@ArgsType()
export class PageArgs {
  @Field(() => Int, { defaultValue: 30 })
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 30;

  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  @Min(0)
  offset = 0;
}
