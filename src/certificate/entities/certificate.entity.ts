import { Course } from "src/courses/entities/course.entity";
import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum CertificateStatus {
  PENDING = "PENDING",
  ISSUED = "ISSUED",
  REVOKED = "REVOKED",
  EXPIRED = "EXPIRED",
}


@Entity("certificate")
export class Certificate {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Course)
  @JoinColumn({ name: "course_id" })
  course: Course;

  @CreateDateColumn({ type: "timestamp" })
  issuedAt: Date;

  @Column({ default: false })
  isRevoked: boolean;

  @Column({ nullable: true })
  expiresAt: Date;

  @Column({ type: "enum", enum: CertificateStatus, default: CertificateStatus.PENDING })
  status: CertificateStatus;

  @Column({ nullable: true, unique: true })
  serialNumber: string;

  @Column({ nullable: true })
  certificateUrl: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;
  
  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}
