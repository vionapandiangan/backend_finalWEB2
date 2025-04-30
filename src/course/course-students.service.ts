import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseStudent } from './course-student.entity';
import { User } from '../user/user.entity';

@Injectable()
export class CourseStudentsService {
  async getStudentsInCourse(courseId: number): Promise<User[]> {
    const courseStudents = await this.courseStudentRepository.find({
      where: { course: { id: courseId } },
      relations: ['user'],
    });
    return courseStudents.map(cs => cs.user);
  }
  constructor(
    @InjectRepository(CourseStudent)
    private readonly courseStudentRepository: Repository<CourseStudent>,
  ) {}

  async isEnrolled(user_id: number, course_id: number): Promise<boolean> {
    const found = await this.courseStudentRepository.findOne({ where: { user: { id: user_id }, course: { id: course_id } } });
    return !!found;
  }

  async addStudent(user_id: number, course_id: number): Promise<void> {
    const exist = await this.isEnrolled(user_id, course_id);
    if (!exist) {
      await this.courseStudentRepository.save({ user: { id: user_id }, course: { id: course_id } });
    }
  }

  async removeStudent(user_id: number, course_id: number): Promise<void> {
    await this.courseStudentRepository.delete({ user: { id: user_id }, course: { id: course_id } });
  }
}
