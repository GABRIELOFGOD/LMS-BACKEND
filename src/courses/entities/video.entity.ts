import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Chapters } from "./chapter.entity";

@Entity({ name: "video" })
export class Video {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  link: string;

  @ManyToOne(() => Chapters, (chapter) => chapter.videos)
  chapter: Chapters;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}