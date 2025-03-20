import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Chapters } from "./chapter.entity";

@Entity({ name: "courses" })
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, default: 0.00 })
  price: number;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ type: "boolean", default: true })
  isFree: boolean;

  @Column({ type: "boolean", default: false })
  publish: boolean;

  @OneToMany(() => Chapters, (chapter) => chapter.course)
  chapters: Chapters[];

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}
