import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Layout de 2026: composição da coligação, atributo quilombola (`ST_QUILOMBOLA`) e `status` maior
 * (`DS_SITUACAO_JULGAMENTO` chega a 43 caracteres).
 */
export class CoalitionAndQuilombola1790190000000 implements MigrationInterface {
  name = 'CoalitionAndQuilombola1790190000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "candidates" ADD "coalition_parties" varchar(300)`);
    await queryRunner.query(`ALTER TABLE "candidates" ALTER COLUMN "status" TYPE varchar(80)`);
    await queryRunner.query(
      `INSERT INTO "attributes" ("slug", "name", "group", "sort_order")
       VALUES ('quilombola', 'Quilombola', 'race', 35) ON CONFLICT ("slug") DO NOTHING`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "attributes" WHERE "slug" = 'quilombola'`);
    await queryRunner.query(`ALTER TABLE "candidates" ALTER COLUMN "status" TYPE varchar(40)`);
    await queryRunner.query(`ALTER TABLE "candidates" DROP COLUMN "coalition_parties"`);
  }
}
