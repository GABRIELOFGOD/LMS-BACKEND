// import { Chapters } from "src/chapters/entities/chapter.entity";
// import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

// @Entity({ name: "video" })
// export class Video {
//   @PrimaryGeneratedColumn("uuid")
//   id: string;

//   @Column()
//   link: string;

//   @ManyToOne(() => Chapters, (chapter) => chapter.videos)
//   chapter: Chapters;

//   @CreateDateColumn({ type: "timestamp" })
//   createdAt: Date;

//   @UpdateDateColumn({ type: "timestamp" })
//   updatedAt: Date;
// }