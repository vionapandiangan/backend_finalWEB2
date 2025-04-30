import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CourseService {
  async findById(id: number, options: any = {}): Promise<Course | null> {
    return this.courseRepository.findOne({ where: { id }, ...options });
  }
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    // Pisahkan dosen_id dari DTO
    const { dosen_id, ...courseData } = createCourseDto as any;
    // Konversi ke number jika perlu
    const dosenIdNum = typeof dosen_id === 'string' ? parseInt(dosen_id, 10) : dosen_id;
    console.log('DEBUG dosen_id:', dosen_id, 'dosenIdNum:', dosenIdNum, typeof dosen_id, createCourseDto);
    if (!dosenIdNum || isNaN(dosenIdNum)) {
      throw new Error('dosen_id harus dikirim dan bertipe number');
    }
    const course = this.courseRepository.create({
      ...courseData,
      dosen: { id: dosenIdNum },
    });
    // Debug log to check type
    console.log('DEBUG typeof course:', Array.isArray(course) ? 'array' : typeof course, course);
    // Type assertion to force type
    return this.courseRepository.save(course) as unknown as Course;
  }

  async findAll(): Promise<any[]> {
    // Ambil semua course
    const courses = await this.courseRepository.find();
    // Ambil jumlah mahasiswa per course
    const courseIds = courses.map(c => c.id);
    // Query count dari tabel course_students
    const rawCounts = await this.courseRepository.manager.query(`
      SELECT course_id, COUNT(user_id) as studentsCount
      FROM course_students
      WHERE course_id IN (${courseIds.length ? courseIds.join(',') : 0})
      GROUP BY course_id
    `);
    console.log('DEBUG rawCounts:', rawCounts);
    // Map hasil count ke object { [course_id]: studentsCount }
    const countMap: Record<number, number> = {};
    rawCounts.forEach((row: any) => {
      countMap[row.course_id] = Number(row.studentsCount);
    });
    console.log('DEBUG countMap:', countMap);
    // Gabungkan ke array courses
    const result = courses.map(course => ({
      ...course,
      studentsCount: countMap[course.id] || 0,
    }));
    console.log('DEBUG result courses:', result);
    return result;
  }

  async findOne(id: number): Promise<Course> {
    const course = await this.courseRepository.findOneBy({ id });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async update(id: number, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.findOne(id);
    Object.assign(course, updateCourseDto);
    return this.courseRepository.save(course);
  }

  async remove(id: number): Promise<void> {
    const course = await this.findOne(id);
    await this.courseRepository.remove(course);
  }
}
