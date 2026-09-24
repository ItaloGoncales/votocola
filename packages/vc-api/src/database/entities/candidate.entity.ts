import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import type { Office } from '../../domain/offices.js';
import type { PoliticalPosition } from '../../domain/positions.js';
import type { SocialLink } from '../../import/social.js';
import { Attribute } from './attribute.entity.js';
import { Party } from './party.entity.js';

@Entity('candidates')
@Index('IDX_candidates_state_office', ['state', 'office'])
export class Candidate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** `SQ_CANDIDATO`: identificador do TSE; chave da importação, das fotos e dos planos. */
  @Column({ type: 'bigint', unique: true })
  tseId!: string;

  @Column({ type: 'smallint' })
  electionYear!: number;

  /** UF da candidatura; `BR` para presidente. */
  @Column({ type: 'char', length: 2 })
  state!: string;

  @Column({ type: 'varchar', length: 20 })
  office!: Office;

  /** Número na urna (texto: a quantidade de dígitos importa). */
  @Column({ type: 'varchar', length: 5 })
  number!: string;

  @Column({ type: 'varchar', length: 100 })
  ballotName!: string;

  @Column({ type: 'varchar', length: 200 })
  fullName!: string;

  @Column({ type: 'smallint' })
  partyNumber!: number;

  @ManyToOne(() => Party, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'party_number' })
  party!: Relation<Party>;

  @Column({ type: 'varchar', length: 300, nullable: true })
  coalitionName!: string | null;

  /** Partidos da coligação (`DS_COMPOSICAO_COLIGACAO`), ex.: `PSD / MDB / PP`. */
  @Column({ type: 'varchar', length: 300, nullable: true })
  coalitionParties!: string | null;

  /** Sobrescreve a posição do partido para este candidato. */
  @Column({ type: 'varchar', length: 20, nullable: true })
  position!: PoliticalPosition | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  gender!: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  raceColor!: string | null;

  @Column({ type: 'date', nullable: true })
  birthDate!: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  education!: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  occupation!: string | null;

  @Column({ type: 'boolean', default: false })
  reelection!: boolean;

  /** `DS_SITUACAO_JULGAMENTO` (DEFERIDO, INDEFERIDO COM RECURSO, RENÚNCIA...). */
  @Column({ type: 'varchar', length: 80, nullable: true })
  status!: string | null;

  /** `DS_DETALHE_SITUACAO_CAND` (detalhe, quando o TSE divulga). */
  @Column({ type: 'varchar', length: 80, nullable: true })
  statusDetail!: string | null;

  /** Falso para quem não está na urna ou teve o voto anulado (renúncia, indeferido...). */
  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @Column({ type: 'boolean', default: false })
  hasPhoto!: boolean;

  /** Arquivo do plano de governo em `storage/planos` (só cargos majoritários). */
  @Column({ type: 'varchar', length: 200, nullable: true })
  planFile!: string | null;

  @Column({ type: 'text', nullable: true })
  planSummary!: string | null;

  /** Nome de urna + nome completo + número + partido, normalizados (ver `normalizeText`). */
  @Column({ type: 'text', select: false })
  searchText!: string;

  /** Escolhas na colinha (1 por aparelho). Nunca sai na API: só ordena a busca. */
  /** Visualizações de perfil (1 por aparelho). Exibida no app, salvo VIEW_COUNT_VISIBLE=false. */
  @Column({ type: 'integer', default: 0 })
  viewCount!: number;

  @Column({ type: 'integer', default: 0, select: false })
  pickCount!: number;

  /** `pick_count * 3 + view_count`, gerada pelo banco. Selecionável porque ordena a busca paginada. */
  @Column({
    type: 'integer',
    generatedType: 'STORED',
    asExpression: '"pick_count" * 3 + "view_count"',
    insert: false,
    update: false,
  })
  popularity!: number;

  /** Redes sociais normalizadas (1 por rede), ver `import/social.ts`. */
  @Column({ type: 'jsonb', default: () => "'[]'" })
  socialLinks!: SocialLink[];

  /** Peso de partida para desempate na busca (mandato + redes), ver `refreshPriorScores`. */
  @Column({ type: 'smallint', default: 0 })
  priorScore!: number;

  @ManyToMany(() => Attribute)
  @JoinTable({
    name: 'candidate_attributes',
    joinColumn: { name: 'candidate_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'attribute_id', referencedColumnName: 'id' },
  })
  attributes!: Relation<Attribute[]>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
