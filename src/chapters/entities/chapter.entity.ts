import { Course } from "src/courses/entities/course.entity";
import { Video } from "src/courses/entities/video.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "chapters" })
export class Chapters {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ type: "boolean", default: false })
  isPublished: boolean;

  @ManyToOne(() => Course, (course) => course.chapters)
  course: Course;

  @OneToMany(() => Video, (video) => video.chapter)
  videos: Video[];

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}