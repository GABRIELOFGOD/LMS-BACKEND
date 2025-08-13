import { Course } from "src/courses/entities/course.entity";
import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity("certificate")
export class Certificate {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Course)
  @JoinColumn({ name: "course_id" })
  course: Course;

  @CreateDateColumn({ type: "timestamp" })
  issuedAt: Date;

  @Column({ default: false })
  isRevoked: boolean;

  @Column({ nullable: true })
  expiresAt: Date;

  @Column()
  status: string;
}
