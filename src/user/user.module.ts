import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CourseProgress } from 'src/courses/entities/courseProgress.entity';
import { Certificate } from 'src/certificate/entities/certificate.entity';
import { EmailService } from 'src/email/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, CourseProgress, Certificate])],
  controllers: [UserController],
  providers: [UserService, EmailService],
})
export class UserModule {}
