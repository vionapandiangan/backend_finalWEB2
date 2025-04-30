import { IsInt } from 'class-validator';

export class AddStudentDto {
  @IsInt()
  user_id: number;
}
