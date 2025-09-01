import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Course } from "./course.entity";

@Entity("enrollments")
export class Enrollment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.enrollments)
  student: User;

  @ManyToOne(() => Course, (course) => course.enrollments)
  course: Course;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  enrolledAt: Date;

  @Column({ default: 0 })
  progress: number;

  @Column({ default: false })
  completed: boolean;
}
