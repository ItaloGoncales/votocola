import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Candidaturas anteriores (`historico_candidatura_2026`), para a página do candidato e para o peso
 * de partida da busca. Atributos novos: já foi eleito(a) / primeira eleição.
 */
export class CandidateHistory1790220000000 implements MigrationInterface {
  name = 'CandidateHistory1790220000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "candidate_history" (
        "id" serial NOT NULL,
        "candidate_id" uuid NOT NULL,
        "election_year" smallint NOT NULL,
        "office" varchar(40) NOT NULL,
        "state" char(2),
        "place" varchar(80),
        "party" varchar(30),
        "result" varchar(60),
        "elected" boolean NOT NULL DEFAULT false,
        "mandate_weight" smallint NOT NULL DEFAULT 0,
        CONSTRAINT "PK_candidate_history" PRIMARY KEY ("id"),
        CONSTRAINT "FK_candidate_history_candidate" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE
      )`);
    await queryRunner.query(
      `CREATE INDEX "IDX_candidate_history_candidate" ON "candidate_history" ("candidate_id", "election_year" DESC)`,
    );
    await queryRunner.query(
      `INSERT INTO "attributes" ("slug", "name", "group", "sort_order") VALUES
         ('elected-before', 'Já foi eleito(a)', 'career', 21),
         ('first-run', 'Primeira eleição', 'career', 22)
       ON CONFLICT ("slug") DO NOTHING`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "attributes" WHERE "slug" IN ('elected-before', 'first-run')`,
    );
    await queryRunner.query(`DROP TABLE "candidate_history"`);
  }
}
