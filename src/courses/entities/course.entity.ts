import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Attachment } from "./attachment.entity";
import { Chapters } from "src/chapters/entities/chapter.entity";
import { Enrollment } from "./enrollments.entity";

@Entity({ name: "courses" })
export class Course {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ default: "", type: "text" })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, default: 0.00 })
  price: number;

  @Column({ default: "", type: "text" })
  imageUrl: string;

  @Column({ type: "boolean", default: true })
  isFree: boolean;

  @Column({ type: "boolean", default: false })
  publish: boolean;

  @OneToMany(() => Chapters, (chapter) => chapter.course)
  chapters: Chapters[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
  enrollments: Enrollment[];

  @Column({ default: false })
  isDeleted: boolean;

  // @ManyToOne(() => Category, (category) => category.courses)
  // category: Category;

  @OneToMany(() => Attachment, (attachment) => attachment.course, { cascade: true })
  attachments: Attachment[];

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}
