import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Redes sociais declaradas ao TSE (já normalizadas, 1 por rede) e o "peso de partida" que desempata
 * a ordem da busca enquanto não há interações suficientes (ver `refreshPriorScores`).
 */
export class SocialLinksAndPriorScore1790210000000 implements MigrationInterface {
  name = 'SocialLinksAndPriorScore1790210000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "candidates"
        ADD "social_links" jsonb NOT NULL DEFAULT '[]',
        ADD "prior_score" smallint NOT NULL DEFAULT 0`);
    await queryRunner.query(`DROP INDEX "IDX_candidates_state_office_popularity"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_candidates_state_office_rank" ON "candidates" ("state", "office", "popularity" DESC, "prior_score" DESC)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_candidates_state_office_rank"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_candidates_state_office_popularity" ON "candidates" ("state", "office", "popularity" DESC)`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidates" DROP COLUMN "prior_score", DROP COLUMN "social_links"`,
    );
  }
}
