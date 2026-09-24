import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Candidate } from './candidate.entity.js';

/** Uma candidatura anterior (turno final), do `historico_candidatura` do TSE. */
@Entity('candidate_history')
@Index('IDX_candidate_history_candidate', ['candidateId', 'electionYear'])
export class CandidateHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'uuid' })
  candidateId!: string;

  @ManyToOne(() => Candidate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'candidate_id' })
  candidate!: Relation<Candidate>;

  @Column({ type: 'smallint' })
  electionYear!: number;

  /** Cargo como o TSE escreve: "Deputado Estadual", "Vereador"... */
  @Column({ type: 'varchar', length: 40 })
  office!: string;

  @Column({ type: 'char', length: 2, nullable: true })
  state!: string | null;

  /** Município (eleições municipais) ou UF. */
  @Column({ type: 'varchar', length: 80, nullable: true })
  place!: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  party!: string | null;

  /** "Eleito(a)", "Suplente", "Não eleito(a)"...; null quando o TSE não informa. */
  @Column({ type: 'varchar', length: 60, nullable: true })
  result!: string | null;

  @Column({ type: 'boolean', default: false })
  elected!: boolean;

  /** Peso do mandato conquistado (0 se não eleito), base do peso de partida. */
  @Column({ type: 'smallint', default: 0 })
  mandateWeight!: number;
}
