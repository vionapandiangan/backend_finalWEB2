import { Controller, Post, Body, Get, Param, Put, Delete, Req, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseStudentsService } from './course-students.service';
import { AddStudentDto } from './dto/add-student.dto';
import { RemoveStudentDto } from './dto/remove-student.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './course.entity';
import { ApiTags, ApiParam } from '@nestjs/swagger';

@ApiTags('courses')
@Controller('courses')
export class CourseController {

  @Get(':id/students')
  async getStudentsInCourse(@Param('id') courseId: number) {
    return this.courseStudentsService.getStudentsInCourse(Number(courseId));
  }
  constructor(
    private readonly courseService: CourseService,
    private readonly courseStudentsService: CourseStudentsService,
  ) {}

  @Post()
  async create(@Body() createCourseDto: CreateCourseDto): Promise<Course> {
    return this.courseService.create(createCourseDto);
  }

  @Get()
  async findAll(): Promise<Course[]> {
    return this.courseService.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: Number })
  async findOne(@Param('id') id: number): Promise<any> {
    const course = await this.courseService.findById(id, { relations: ['dosen'] });
    if (!course) throw new NotFoundException('Course not found');
    return {
      ...course,
      dosen_id: course.dosen?.id,
    };
  }

  @Put(':id')
  @ApiParam({ name: 'id', type: Number })
  async update(@Param('id') id: number, @Body() updateCourseDto: UpdateCourseDto): Promise<Course> {
    return this.courseService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: Number })
  async remove(@Param('id') id: number): Promise<void> {
    return this.courseService.remove(id);
  }

  // Tambah mahasiswa ke course
  @Post(':id/add-student')
  async addStudentToCourse(
    @Param('id') courseId: number,
    @Body() addStudentDto: AddStudentDto,
    @Req() req: any
  ) {
    // Hanya dosen pengampu atau admin yang boleh mengelola
    const user = req.user;
    const course = await this.courseService.findById(courseId, { relations: ['dosen'] });
    if (!course) throw new ForbiddenException('Course tidak ditemukan');
    if (!(user.role === 'admin' || (user.role === 'dosen' && course.dosen.id === user.sub))) {
      throw new ForbiddenException('Anda tidak berhak mengelola mahasiswa di kelas ini');
    }
    await this.courseStudentsService.addStudent(addStudentDto.user_id, courseId);
    return { message: 'Mahasiswa berhasil ditambahkan ke course' };
  }

  // Hapus mahasiswa dari course
  @Delete(':id/remove-student')
  async removeStudentFromCourse(
    @Param('id') courseId: number,
    @Body() removeStudentDto: RemoveStudentDto,
    @Req() req: any
  ) {
    const user = req.user;
    const course = await this.courseService.findById(courseId, { relations: ['dosen'] });
    if (!course) throw new ForbiddenException('Course tidak ditemukan');
    if (!(user.role === 'admin' || (user.role === 'dosen' && course.dosen.id === user.sub))) {
      throw new ForbiddenException('Anda tidak berhak mengelola mahasiswa di kelas ini');
    }
    await this.courseStudentsService.removeStudent(removeStudentDto.user_id, courseId);
    return { message: 'Mahasiswa berhasil dihapus dari course' };
  }
}
