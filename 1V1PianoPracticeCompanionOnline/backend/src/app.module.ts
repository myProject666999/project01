import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { CoursePackagesModule } from './modules/course-packages/course-packages.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { SheetMusicModule } from './modules/sheet-music/sheet-music.module';
import { AnnotationsModule } from './modules/annotations/annotations.module';
import { EvaluationsModule } from './modules/evaluations/evaluations.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => typeOrmConfig(configService),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    TeachersModule,
    CoursePackagesModule,
    BookingsModule,
    LessonsModule,
    SheetMusicModule,
    AnnotationsModule,
    EvaluationsModule,
  ],
})
export class AppModule {}
