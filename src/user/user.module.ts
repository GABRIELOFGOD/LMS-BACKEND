import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CourseProgress } from 'src/courses/entities/courseProgress.entity';
import { Certificate } from 'src/certificate/entities/certificate.entity';
import { EmailService } from 'src/email/email.service';
import { Enrollment } from 'src/courses/entities/enrollments.entity';
import { Course } from 'src/courses/entities/course.entity';
import { Attachment } from 'src/courses/entities/attachment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, CourseProgress, Certificate, Enrollment, Course, Attachment])],
  controllers: [UserController],
  providers: [UserService, EmailService],
})
export class UserModule {}
