import { IsInt } from 'class-validator';

export class RemoveStudentDto {
  @IsInt()
  user_id: number;
}
