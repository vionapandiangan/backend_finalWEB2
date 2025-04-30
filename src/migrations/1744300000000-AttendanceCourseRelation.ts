import { MigrationInterface, QueryRunner } from 'typeorm';

export class AttendanceCourseRelation1744300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tambah kolom course_id
    await queryRunner.query(`ALTER TABLE attendances ADD COLUMN course_id INTEGER;`);
    // Jika ada data lama, migrasikan (optional, diisi manual jika perlu)
    // Tambahkan foreign key
    await queryRunner.query(`ALTER TABLE attendances ADD CONSTRAINT fk_course FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE;`);
    // Hapus kolom course lama jika masih ada
    await queryRunner.query(`ALTER TABLE attendances DROP COLUMN IF EXISTS course;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE attendances ADD COLUMN course VARCHAR(255);`);
    await queryRunner.query(`ALTER TABLE attendances DROP CONSTRAINT IF EXISTS fk_course;`);
    await queryRunner.query(`ALTER TABLE attendances DROP COLUMN course_id;`);
  }
}
