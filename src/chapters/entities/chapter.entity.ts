// import { Course } from "src/courses/entities/course.entity";
// import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

// @Entity({ name: "chapters" })
// export class Chapters {
//   @PrimaryGeneratedColumn("uuid")
//   id: string;

//   @Column()
//   name: string;

//   @Column({ type: "boolean", default: false })
//   isPublished: boolean;

//   @ManyToOne(() => Course, (course) => course.chapters)
//   course: Course;

//   @Column({ nullable: true })
//   video: string;

//   @CreateDateColumn({ type: "timestamp" })
//   createdAt: Date;

//   @UpdateDateColumn({ type: "timestamp" })
//   updatedAt: Date;
// }

import { Course } from "src/courses/entities/course.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "chapters" })
export class Chapters {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ type: "boolean", default: false })
  isPublished: boolean;

  @Column({ type: "int", default: 1 })
  position: number;

  @ManyToOne(() => Course, (course) => course.chapters)
  course: Course;

  @Column({ nullable: true })
  video: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}
