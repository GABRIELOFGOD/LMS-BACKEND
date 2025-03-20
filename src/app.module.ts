import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoursesModule } from './courses/courses.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService, ConfigModule } from "@nestjs/config";
import { Course } from './courses/entities/course.entity';
import { Chapters } from './courses/entities/chapter.entity';
import { Video } from './courses/entities/video.entity';

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
        entities: [Course, Chapters, Video],
        synchronize: true, // ⚠️ Set to false in production!
      }),
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
