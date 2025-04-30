import { Injectable, Post } from '@nestjs/common';
import { Attendance } from './attendance.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance) private attendanceRepository: Repository<Attendance>,
  ) {}

  async save(attendance: Attendance): Promise<Attendance> {
    return this.attendanceRepository.save(attendance);
  }

  async findAll(page: number, limit: number): Promise<Attendance[]> {
    return await this.attendanceRepository.find({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        timestamp: 'DESC',
      },
      relations: ['course', 'user'],
    });
  }

  async findById(id: number): Promise<Attendance | null> {
    return await this.attendanceRepository.findOne({ where: { id } });
  }

  async findByUserId(user_id: number, course_id?: number): Promise<Attendance[]> {
    const where: any = { user_id };
    if (course_id) where.course_id = course_id;
    return this.attendanceRepository.find({ where, relations: ['course', 'user'] });
  }

  async findFiltered(
    user_id?: number,
    course_id?: number,
    start_date?: string,
    end_date?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<Attendance[]> {
    const where: any = {};
    if (user_id) where.user_id = user_id;
    if (course_id) where.course_id = course_id;
    if (start_date || end_date) {
      where.timestamp = {};
      if (start_date) where.timestamp['$gte'] = new Date(start_date);
      if (end_date) {
        // Tambahkan 1 hari ke end_date agar filter <= end_date
        const end = new Date(end_date);
        end.setDate(end.getDate() + 1);
        where.timestamp['$lt'] = end;
      }
    }
    return this.attendanceRepository.find({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { timestamp: 'DESC' },
      relations: ['course', 'user'],
    });
  }

  async deleteById(id: number) {
    await this.attendanceRepository.delete({ id });
  }
}
