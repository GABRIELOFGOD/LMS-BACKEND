import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from 'src/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { CourseProgress } from 'src/courses/entities/courseProgress.entity';
import { Certificate } from 'src/certificate/entities/certificate.entity';
import { EmailService } from 'src/email/email.service';
import { Enrollment } from 'src/courses/entities/enrollments.entity';
import { Attachment } from 'src/courses/entities/attachment.entity';
import { Course } from 'src/courses/entities/course.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, CourseProgress, Certificate, Enrollment, Course, Attachment]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig)
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, LocalStrategy, JwtStrategy, EmailService],
})
export class AuthModule {}
