import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from '../course/course.entity';
import { User } from '../user/user.entity';

@Entity('attendances')
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => User, { eager: true, nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Course, course => course.attendances, { eager: true, nullable: false })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column()
  course_id: number;

  @Column({ default: 'hadir' })
  status: string; // hadir, izin, sakit, alfa

  @CreateDateColumn()
  timestamp: Date;
}
