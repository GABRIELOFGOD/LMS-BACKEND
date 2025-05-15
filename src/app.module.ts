import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoursesModule } from './courses/courses.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService, ConfigModule } from "@nestjs/config";
import { Course } from './courses/entities/course.entity';
import { Video } from './courses/entities/video.entity';
import { CategoriesModule } from './categories/categories.module';
import { Category } from './categories/entities/category.entity';
import { Attachment } from './courses/entities/attachment.entity';
import { ChaptersModule } from './chapters/chapters.module';
import { Chapters } from './chapters/entities/chapter.entity';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { EmailService } from './email/email.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CoursesModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [Course, Chapters, Video, Category, Attachment, User],
        synchronize: true, // ⚠️ Set to false in production!
      }),
    }),
    CategoriesModule,
    ChaptersModule,
    AuthModule,
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService, EmailService],
})
export class AppModule {}
