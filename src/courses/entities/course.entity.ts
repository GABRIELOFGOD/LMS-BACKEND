import { Column, CreateDateColumn, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Attachment } from "./attachment.entity";
import { Chapters } from "src/chapters/entities/chapter.entity";
import { User } from "src/user/entities/user.entity";

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

  @ManyToMany(() => User, (user) => user.enrolled)
  students: User[];

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
