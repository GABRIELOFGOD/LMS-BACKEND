import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Course } from "./course.entity";
import { Video } from "./video.entity";

@Entity({ name: "chapters" })
export class Chapters {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Course, (course) => course.chapters)
  course: Course;

  @OneToMany(() => Video, (video) => video.chapter)
  videos: Video[];

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}