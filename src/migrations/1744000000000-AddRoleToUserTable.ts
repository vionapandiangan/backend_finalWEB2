import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRoleToUserTable1744000000000 implements MigrationInterface {
  name = 'AddRoleToUserTable1744000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "role" character varying NOT NULL DEFAULT 'mahasiswa'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "role"`
    );
  }
}
