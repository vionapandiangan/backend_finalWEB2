import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateAttendanceDTO {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  user_id: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  course_id: number;

  @IsString()
  @ApiProperty({ required: false, default: 'hadir', enum: ['hadir', 'izin', 'sakit', 'alfa'] })
  status?: string;
}