import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  BadRequestException
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload.dto';
import { CreateAttendanceDTO } from './create-attendance.dto';
import { AttendanceService } from './attendance.service';
import { CourseService } from '../course/course.service';
import { CourseStudentsService } from '../course/course-students.service';
import { Attendance } from './attendance.entity';
import { ApiParam, ApiQuery } from '@nestjs/swagger';

import { Roles } from '../auth/roles.decorator';
import { RoleGuard } from '../auth/role.guard';

@Controller('attendance')
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly userService: UserService,
    private readonly courseService: CourseService,
    private readonly courseStudentsService: CourseStudentsService,
  ) {}

  @Post()
  @Roles('dosen')
  async create(@Req() request: Request, @Body() createAttendanceDTO: CreateAttendanceDTO) {
    // Validasi: hanya mahasiswa yang bisa diabsenkan
    const user = await this.userService.findById(createAttendanceDTO.user_id);
    if (!user || user.role !== 'mahasiswa') {
      throw new BadRequestException('Absensi hanya bisa untuk mahasiswa.');
    }
    // Validasi: dosen hanya bisa absenkan mahasiswa di kelasnya sendiri
    const userJwtPayload: JwtPayloadDto = request['user'];
    const course = await this.courseService.findById(createAttendanceDTO.course_id, { relations: ['dosen'] });
    if (!course || course.dosen.id !== userJwtPayload.sub) {
      throw new BadRequestException('Anda bukan dosen pengampu mata kuliah ini.');
    }
    const enrolled = await this.courseStudentsService.isEnrolled(createAttendanceDTO.user_id, course.id);
    if (!enrolled) {
      throw new BadRequestException('Mahasiswa tidak terdaftar di mata kuliah ini.');
    }
    const attendance = new Attendance();
    attendance.user_id = createAttendanceDTO.user_id;
    attendance.course_id = createAttendanceDTO.course_id;
    attendance.status = createAttendanceDTO.status || 'hadir';
    await this.attendanceService.save(attendance);
  }

  @Get()
  @Roles('mahasiswa', 'dosen', 'admin')
  @ApiQuery({ name: 'user_id', required: false, type: Number })
  @ApiQuery({ name: 'course_id', required: false, type: Number })
  @ApiQuery({ name: 'start_date', required: false, type: String, description: 'Format: YYYY-MM-DD' })
  @ApiQuery({ name: 'end_date', required: false, type: String, description: 'Format: YYYY-MM-DD' })
  async getAttendance(
    @Req() request: Request,
    @Query('user_id') user_id?: number,
    @Query('course_id') course_id?: number,
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<Attendance[]> {
    const userJwtPayload: JwtPayloadDto = request['user'];
    const role = userJwtPayload.role;
    if (role === 'mahasiswa') {
      // Mahasiswa hanya bisa lihat absensi miliknya sendiri, bisa filter per mata kuliah
      return this.attendanceService.findByUserId(userJwtPayload.sub, course_id);
    }
    // Dosen/admin bisa filter by user_id/course_id/start_date/end_date
    return this.attendanceService.findFiltered(user_id, course_id, start_date, end_date, page, limit);
  }

  // Endpoint untuk dosen/admin melihat semua absensi (rekap seluruh mahasiswa)
  @Get('rekap')
  @Roles('dosen', 'admin')
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<Attendance[]> {
    return await this.attendanceService.findAll(page, limit);
  }

  @Get(':id')
  @Roles('dosen', 'admin')
  @ApiParam({ name: 'id', type: Number, description: 'ID of the attendance' })
  async findOne(
    @Param('id') id: number,
  ): Promise<Attendance> {
    const attendance = await this.attendanceService.findById(id);
    if (!attendance) {
      throw new NotFoundException('Attendance not found');
    }
    return attendance;
  }

  @Put(':id')
  @Roles('dosen', 'admin')
  @ApiParam({ name: 'id', type: Number, description: 'ID of the attendance' })
  async updateOne(
    @Param('id') id: number,
    @Body() updateAttendanceDTO: CreateAttendanceDTO,
  ) {
    const attendance = await this.attendanceService.findById(id);
    if (!attendance) {
      throw new NotFoundException('Attendance not found');
    }
    attendance.course_id = updateAttendanceDTO.course_id || attendance.course_id;
    attendance.status = updateAttendanceDTO.status || attendance.status;
    await this.attendanceService.save(attendance);
  }

  @Delete(':id')
  @Roles('dosen', 'admin')
  @ApiParam({ name: 'id', type: Number, description: 'ID of the attendance' })
  async deleteOne(@Param('id') id: number) {
    const attendance = await this.attendanceService.findById(id);
    if (!attendance) {
      throw new NotFoundException('Attendance not found');
    }
    await this.attendanceService.deleteById(id);
  }
}
