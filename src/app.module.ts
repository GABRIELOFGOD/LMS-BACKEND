import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoursesModule } from './courses/courses.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService, ConfigModule } from "@nestjs/config";
import { Course } from './courses/entities/course.entity';
import { Attachment } from './courses/entities/attachment.entity';
import { ChaptersModule } from './chapters/chapters.module';
import { Chapters } from './chapters/entities/chapter.entity';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { EmailService } from './email/email.service';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, expandVariables: true, load: [jwtConfig] }),
    CoursesModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // useFactory: (configService: ConfigService) => ({
      //   type: 'postgres',
      //   host: configService.get<string>('DATABASE_HOST'),
      //   port: configService.get<number>('DATABASE_PORT'),
      //   username: configService.get<string>('DATABASE_USER'),
      //   password: configService.get<string>('DATABASE_PASSWORD'),
      //   database: configService.get<string>('DATABASE_NAME'),
      //   entities: [Course, Chapters, Attachment, User],
      //   synchronize: true, // ⚠️ Set to false in production!
      // }),
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [Course, Chapters, Attachment, User],
        synchronize: true, // ⚠️ Set to false in production!
        ssl: process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false
      }),
    }),
    ChaptersModule,
    AuthModule,
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService, EmailService],
})
export class AppModule {}
