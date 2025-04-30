import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserRelationToAttendance1745000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Hanya tambahkan constraint jika belum ada
        await queryRunner.query(`
            ALTER TABLE "attendances"
            ADD CONSTRAINT "FK_attendance_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "attendances"
            DROP CONSTRAINT "FK_attendance_user"
        `);
    }
}