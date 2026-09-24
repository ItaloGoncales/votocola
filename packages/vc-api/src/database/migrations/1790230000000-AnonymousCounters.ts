import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Privacidade: deixa de guardar interações por aparelho. Escolher candidato é opinião política
 * (dado sensível na LGPD); agora o servidor guarda só os totais por candidato, e o controle de
 * "já contei" fica no próprio aparelho.
 */
export class AnonymousCounters1790230000000 implements MigrationInterface {
  name = 'AnonymousCounters1790230000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "candidate_interactions"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
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
}
