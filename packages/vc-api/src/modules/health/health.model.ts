import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Health {
  @Field(() => String)
  status!: string;

  @Field(() => Int, { description: 'Segundos desde que a API subiu' })
  uptime!: number;
}
