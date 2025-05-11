import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Chapters } from "./chapter.entity";
import { Category } from "src/categories/entities/category.entity";

@Entity({ name: "courses" })
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

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

  @ManyToOne(() => Category, (category) => category.courses)
  category: Category;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}
