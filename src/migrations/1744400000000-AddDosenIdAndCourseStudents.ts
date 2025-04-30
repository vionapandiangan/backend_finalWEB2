import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDosenIdAndCourseStudents1744400000000 implements MigrationInterface {
    name = 'AddDosenIdAndCourseStudents1744400000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Tambah kolom dulu sebagai nullable
        await queryRunner.query(`ALTER TABLE courses ADD COLUMN dosen_id integer`);
        
        // 2. Isi data yang ada dengan default value (user_id=1 sebagai admin/dosen)
        // Pastikan user dengan id=1 ada dan role-nya dosen/admin
        await queryRunner.query(`UPDATE courses SET dosen_id = 1 WHERE dosen_id IS NULL`);
        
        // 3. Baru tambahkan constraint NOT NULL
        await queryRunner.query(`ALTER TABLE courses ALTER COLUMN dosen_id SET NOT NULL`);
        
        // 4. Tambahkan foreign key constraint
        await queryRunner.query(`ALTER TABLE courses ADD CONSTRAINT fk_dosen FOREIGN KEY (dosen_id) REFERENCES users(id) ON DELETE CASCADE`);

        // 5. Buat tabel course_students
        await queryRunner.query(`CREATE TABLE course_students (
            id SERIAL PRIMARY KEY,
            course_id integer NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
            user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE
        )`);
        await queryRunner.query(`CREATE UNIQUE INDEX idx_unique_course_student ON course_students(course_id, user_id)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS idx_unique_course_student`);
        await queryRunner.query(`DROP TABLE IF EXISTS course_students`);
        await queryRunner.query(`ALTER TABLE courses DROP CONSTRAINT fk_dosen`);
        await queryRunner.query(`ALTER TABLE courses DROP COLUMN dosen_id`);
    }
}
