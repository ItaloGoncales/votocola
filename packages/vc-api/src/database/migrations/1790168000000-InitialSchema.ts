import { MigrationInterface, QueryRunner } from 'typeorm';

/** [slug, name, group, sortOrder]. Dados literais: a migration não muda com o código. */
const ATTRIBUTES: [string, string, string, number][] = [
  ['woman', 'Mulher', 'gender', 10],
  ['man', 'Homem', 'gender', 11],
  ['reelection', 'Tentando reeleição', 'career', 20],
  ['race-black', 'Preta', 'race', 30],
  ['race-brown', 'Parda', 'race', 31],
  ['race-white', 'Branca', 'race', 32],
  ['race-yellow', 'Amarela', 'race', 33],
  ['race-indigenous', 'Indígena', 'race', 34],
];

export class InitialSchema1790168000000 implements MigrationInterface {
  name = 'InitialSchema1790168000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);

    await queryRunner.query(`
      CREATE TABLE "parties" (
        "number" smallint NOT NULL,
        "acronym" varchar(30) NOT NULL,
        "name" varchar(150) NOT NULL,
        "position" varchar(20),
        "federation_acronym" varchar(60),
        "federation_name" varchar(150),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_parties" PRIMARY KEY ("number"),
        CONSTRAINT "CHK_parties_position" CHECK ("position" IN ('LEFT','CENTER_LEFT','CENTER','CENTER_RIGHT','RIGHT'))
      )`);

    await queryRunner.query(`
      CREATE TABLE "attributes" (
        "id" smallserial NOT NULL,
        "slug" varchar(50) NOT NULL,
        "name" varchar(80) NOT NULL,
        "group" varchar(30) NOT NULL,
        "sort_order" smallint NOT NULL DEFAULT 0,
        CONSTRAINT "PK_attributes" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_attributes_slug" UNIQUE ("slug")
      )`);

    await queryRunner.query(`
      CREATE TABLE "candidates" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tse_id" bigint NOT NULL,
        "election_year" smallint NOT NULL,
        "state" char(2) NOT NULL,
        "office" varchar(20) NOT NULL,
        "number" varchar(5) NOT NULL,
        "ballot_name" varchar(100) NOT NULL,
        "full_name" varchar(200) NOT NULL,
        "party_number" smallint NOT NULL,
        "coalition_name" varchar(300),
        "position" varchar(20),
        "gender" varchar(30),
        "race_color" varchar(30),
        "birth_date" date,
        "education" varchar(80),
        "occupation" varchar(120),
        "reelection" boolean NOT NULL DEFAULT false,
        "status" varchar(40),
        "status_detail" varchar(80),
        "active" boolean NOT NULL DEFAULT true,
        "has_photo" boolean NOT NULL DEFAULT false,
        "plan_file" varchar(200),
        "plan_summary" text,
        "search_text" text NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_candidates" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_candidates_tse_id" UNIQUE ("tse_id"),
        CONSTRAINT "FK_candidates_party" FOREIGN KEY ("party_number") REFERENCES "parties"("number") ON DELETE RESTRICT,
        CONSTRAINT "CHK_candidates_office" CHECK ("office" IN ('PRESIDENT','GOVERNOR','SENATOR','FEDERAL_DEPUTY','STATE_DEPUTY','DISTRICT_DEPUTY')),
        CONSTRAINT "CHK_candidates_position" CHECK ("position" IN ('LEFT','CENTER_LEFT','CENTER','CENTER_RIGHT','RIGHT'))
      )`);
    await queryRunner.query(
      `CREATE INDEX "IDX_candidates_state_office" ON "candidates" ("state", "office")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_candidates_search" ON "candidates" USING gin ("search_text" gin_trgm_ops)`,
    );

    await queryRunner.query(`
      CREATE TABLE "candidate_attributes" (
        "candidate_id" uuid NOT NULL,
        "attribute_id" smallint NOT NULL,
        CONSTRAINT "PK_candidate_attributes" PRIMARY KEY ("candidate_id", "attribute_id"),
        CONSTRAINT "FK_candidate_attributes_candidate" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_candidate_attributes_attribute" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE CASCADE
      )`);
    await queryRunner.query(
      `CREATE INDEX "IDX_candidate_attributes_attribute" ON "candidate_attributes" ("attribute_id")`,
    );

    for (const [slug, name, group, sortOrder] of ATTRIBUTES) {
      await queryRunner.query(
        `INSERT INTO "attributes" ("slug", "name", "group", "sort_order") VALUES ($1, $2, $3, $4)`,
        [slug, name, group, sortOrder],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "candidate_attributes"`);
    await queryRunner.query(`DROP TABLE "candidates"`);
    await queryRunner.query(`DROP TABLE "attributes"`);
    await queryRunner.query(`DROP TABLE "parties"`);
  }
}
