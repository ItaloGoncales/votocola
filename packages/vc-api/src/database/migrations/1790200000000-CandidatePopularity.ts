import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Popularidade para ordenar a busca: visualizações e escolhas na colinha, contadas uma vez por
 * aparelho (`candidate_interactions` guarda só o hash do identificador do aparelho).
 */
export class CandidatePopularity1790200000000 implements MigrationInterface {
  name = 'CandidatePopularity1790200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "candidates"
        ADD "view_count" integer NOT NULL DEFAULT 0,
        ADD "pick_count" integer NOT NULL DEFAULT 0`);
    // Escolher pesa mais que abrir o perfil.
    await queryRunner.query(`
      ALTER TABLE "candidates"
        ADD "popularity" integer GENERATED ALWAYS AS ("pick_count" * 3 + "view_count") STORED`);
    await queryRunner.query(
      `CREATE INDEX "IDX_candidates_state_office_popularity" ON "candidates" ("state", "office", "popularity" DESC)`,
    );
    await queryRunner.query(`
      CREATE TABLE "candidate_interactions" (
        "candidate_id" uuid NOT NULL,
        "device_hash" char(64) NOT NULL,
        "kind" varchar(10) NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_candidate_interactions" PRIMARY KEY ("candidate_id", "device_hash", "kind"),
        CONSTRAINT "FK_candidate_interactions_candidate" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE,
        CONSTRAINT "CHK_candidate_interactions_kind" CHECK ("kind" IN ('VIEW', 'PICK'))
      )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "candidate_interactions"`);
    await queryRunner.query(`DROP INDEX "IDX_candidates_state_office_popularity"`);
    await queryRunner.query(
      `ALTER TABLE "candidates" DROP COLUMN "popularity", DROP COLUMN "pick_count", DROP COLUMN "view_count"`,
    );
  }
}
