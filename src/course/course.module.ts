import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './course.entity';
import { CourseStudent } from './course-student.entity';
import { CourseService } from './course.service';
import { CourseStudentsService } from './course-students.service';
import { CourseController } from './course.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Course, CourseStudent])],
  providers: [CourseService, CourseStudentsService],
  controllers: [CourseController],
  exports: [CourseService, CourseStudentsService],
})
export class CourseModule {}
