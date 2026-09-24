import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('Attribute')
export class AttributeDto {
  @Field(() => String)
  slug!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String, { description: 'Grupo no filtro: gender, race, career...' })
  group!: string;
}
