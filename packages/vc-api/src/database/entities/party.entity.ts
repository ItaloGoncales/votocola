import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import type { PoliticalPosition } from '../../domain/positions.js';

@Entity('parties')
export class Party {
  /** Número do partido no TSE (`NR_PARTIDO`), ex.: 13, 22, 45. */
  @PrimaryColumn({ type: 'smallint' })
  number!: number;

  @Column({ type: 'varchar', length: 30 })
  acronym!: string;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  /** Posição política padrão dos candidatos do partido. Editorial, não vem do TSE. */
  @Column({ type: 'varchar', length: 20, nullable: true })
  position!: PoliticalPosition | null;

  @Column({ type: 'varchar', length: 60, nullable: true })
  federationAcronym!: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  federationName!: string | null;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
