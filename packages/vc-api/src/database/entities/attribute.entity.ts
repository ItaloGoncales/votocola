import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Característica genérica usada como filtro (mulher, reeleição, cor/raça...). Novos atributos
 * entram só com dados: um registro aqui e os vínculos em `candidate_attributes`.
 */
@Entity('attributes')
export class Attribute {
  @PrimaryGeneratedColumn({ type: 'smallint' })
  id!: number;

  /** Identificador estável usado pelo app, ex.: `woman`, `reelection`, `race-black`. */
  @Column({ type: 'varchar', length: 50, unique: true })
  slug!: string;

  @Column({ type: 'varchar', length: 80 })
  name!: string;

  /** Agrupa atributos no filtro, ex.: `gender`, `race`, `career`. */
  @Column({ type: 'varchar', length: 30 })
  group!: string;

  @Column({ type: 'smallint', default: 0 })
  sortOrder!: number;
}
