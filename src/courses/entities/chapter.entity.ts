import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, CreateDateColumn } from "typeorm";
import { User } from "src/user/entities/user.entity";
import { Chapters } from "src/chapters/entities/chapter.entity";
import { Course } from "./course.entity";

@Entity("chapter_progress")
export class ChapterProgress {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Course)
  @JoinColumn({ name: "course_id" })
  course: Course;

  @ManyToOne(() => Chapters)
  @JoinColumn({ name: "chapter_id" })
  chapter: Chapters;

  @Column({ default: false })
  completed: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
