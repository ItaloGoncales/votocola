import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Office, PoliticalPosition } from '../../../graphql/enums.js';
import { AttributeDto } from '../../attributes/attribute.dto.js';
import { PartyDto } from '../../parties/party.dto.js';

@ObjectType('SocialLink')
export class SocialLinkDto {
  @Field(() => String, {
    description:
      'instagram, facebook, tiktok, youtube, x, threads, kwai, linkedin, whatsapp, telegram ou site',
  })
  network!: string;

  @Field(() => String)
  url!: string;
}

@ObjectType('ElectionHistory', { description: 'Candidatura anterior (turno final)' })
export class ElectionHistoryDto {
  @Field(() => Int)
  year!: number;

  @Field(() => String)
  office!: string;

  @Field(() => String, { nullable: true, description: 'Município ou UF, ex.: "Teresina (PI)"' })
  place!: string | null;

  @Field(() => String, { nullable: true })
  party!: string | null;

  @Field(() => String, { nullable: true, description: 'Eleito(a), Suplente, Não eleito(a)...' })
  result!: string | null;

  @Field(() => Boolean)
  elected!: boolean;
}

@ObjectType('Candidate')
export class CandidateDto {
  @Field(() => ID)
  id!: string;

  @Field(() => String, { description: 'SQ_CANDIDATO do TSE' })
  tseId!: string;

  @Field(() => String, { description: 'UF da candidatura; BR para presidente' })
  state!: string;

  @Field(() => Office)
  office!: Office;

  @Field(() => String)
  officeLabel!: string;

  @Field(() => String, { description: 'Número na urna' })
  number!: string;

  @Field(() => String)
  ballotName!: string;

  @Field(() => String)
  fullName!: string;

  @Field(() => PartyDto)
  party!: PartyDto;

  @Field(() => String, { nullable: true })
  coalitionName!: string | null;

  @Field(() => String, { nullable: true, description: 'Partidos da coligação' })
  coalitionParties!: string | null;

  @Field(() => PoliticalPosition, {
    nullable: true,
    description: 'Posição do candidato ou, na falta dela, a do partido',
  })
  position!: PoliticalPosition | null;

  @Field(() => String, { nullable: true })
  positionLabel!: string | null;

  @Field(() => String, { nullable: true })
  gender!: string | null;

  @Field(() => String, { nullable: true })
  raceColor!: string | null;

  @Field(() => String, { nullable: true, description: 'YYYY-MM-DD' })
  birthDate!: string | null;

  @Field(() => Int, { nullable: true, description: 'Idade no dia da eleição' })
  age!: number | null;

  @Field(() => String, { nullable: true })
  education!: string | null;

  @Field(() => String, { nullable: true })
  occupation!: string | null;

  @Field(() => Boolean)
  reelection!: boolean;

  @Field(() => String, { nullable: true })
  status!: string | null;

  @Field(() => String, { nullable: true })
  statusDetail!: string | null;

  @Field(() => Boolean, { description: 'Falso para quem saiu da disputa' })
  active!: boolean;

  @Field(() => String, { nullable: true })
  photoUrl!: string | null;

  @Field(() => String, { nullable: true, description: 'PDF do plano de governo' })
  planUrl!: string | null;

  @Field(() => String, { nullable: true, description: 'Resumo do plano de governo' })
  planSummary!: string | null;

  @Field(() => [AttributeDto])
  attributes!: AttributeDto[];

  @Field(() => [SocialLinkDto], { description: 'Redes sociais declaradas ao TSE (1 por rede)' })
  socialLinks!: SocialLinkDto[];

  @Field(() => [ElectionHistoryDto], {
    description: 'Candidaturas anteriores, da mais recente para a mais antiga (só no detalhe)',
  })
  history!: ElectionHistoryDto[];

  @Field(() => Int, {
    nullable: true,
    description: 'Visualizações do perfil (1 por aparelho); null quando a exibição está desligada',
  })
  viewCount!: number | null;

  @Field(() => String, { nullable: true, description: 'viewCount formatado: 999, 1,2 mil, 3,4 mi' })
  viewCountLabel!: string | null;
}

@ObjectType('CandidatePage')
export class CandidatePageDto {
  @Field(() => [CandidateDto])
  items!: CandidateDto[];

  @Field(() => Int)
  total!: number;

  @Field(() => Boolean, { description: 'Há mais itens depois desta página' })
  hasMore!: boolean;

  @Field(() => Int, { nullable: true, description: 'offset da próxima página (null no fim)' })
  nextOffset!: number | null;
}
