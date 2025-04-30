import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenamePostsToAttendances1744100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename table
    await queryRunner.query(`ALTER TABLE posts RENAME TO attendances;`);
    // Rename columns if needed (example: title -> course, content -> status, image_url -> timestamp)
    await queryRunner.query(`ALTER TABLE attendances RENAME COLUMN title TO course;`);
    await queryRunner.query(`ALTER TABLE attendances RENAME COLUMN content TO status;`);
    await queryRunner.query(`ALTER TABLE attendances RENAME COLUMN created_at TO timestamp;`);
    // Drop unused columns if needed (image_url, updated_at)
    await queryRunner.query(`ALTER TABLE attendances DROP COLUMN image_url;`);
    await queryRunner.query(`ALTER TABLE attendances DROP COLUMN updated_at;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert table and columns
    await queryRunner.query(`ALTER TABLE attendances ADD COLUMN image_url TEXT;`);
    await queryRunner.query(`ALTER TABLE attendances ADD COLUMN updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP;`);
    await queryRunner.query(`ALTER TABLE attendances RENAME COLUMN timestamp TO created_at;`);
    await queryRunner.query(`ALTER TABLE attendances RENAME COLUMN status TO content;`);
    await queryRunner.query(`ALTER TABLE attendances RENAME COLUMN course TO title;`);
    await queryRunner.query(`ALTER TABLE attendances RENAME TO posts;`);
  }
}
