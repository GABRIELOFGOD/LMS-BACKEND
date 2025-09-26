import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Course } from "./course.entity";

@Entity("course_progress")
export class CourseProgress {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Course, (course) => course.enrollments)
  @JoinColumn({ name: "course_id" })
  course: Course;

  @ManyToOne(() => User, (user) => user.enrollments)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // percentage (0-100) or ratio (0-1)
  @Column({ type: "float", default: 0 })
  progress: number;

  @Column({ default: false })
  completed: boolean;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}
