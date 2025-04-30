import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Attendance } from '../attendance/attendance.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'dosen_id' })
  dosen: User;


  @OneToMany(() => Attendance, attendance => attendance.course)
  attendances: Attendance[];
}
