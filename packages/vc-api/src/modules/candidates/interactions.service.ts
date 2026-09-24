import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export enum InteractionKind {
  /** Abriu o perfil do candidato. */
  VIEW = 'VIEW',
  /** Colocou o candidato na colinha. */
  PICK = 'PICK',
}

const COUNTER: Record<InteractionKind, string> = {
  [InteractionKind.VIEW]: 'view_count',
  [InteractionKind.PICK]: 'pick_count',
};

@Injectable()
export class InteractionsService {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  /**
   * Soma 1 ao contador do candidato. Nada sobre quem enviou é guardado (nem aparelho, nem IP):
   * o app evita contar duas vezes o mesmo candidato, e o rate limit por IP (em memória) segura
   * abuso. Devolve se o candidato existe.
   */
  async track(candidateId: string, kind: InteractionKind): Promise<boolean> {
    // SELECT no fim: com UPDATE ... RETURNING o TypeORM devolve [linhas, contagem], não as linhas.
    const [{ counted }]: { counted: number }[] = await this.db.query(
      `WITH upd AS (
         UPDATE candidates SET ${COUNTER[kind]} = ${COUNTER[kind]} + 1 WHERE id = $1 RETURNING id
       )
       SELECT count(*)::int AS counted FROM upd`,
      [candidateId],
    );
    return counted > 0;
  }
}
