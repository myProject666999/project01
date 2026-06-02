import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnnotationsService } from './annotations.service';
import { AnnotationsController } from './annotations.controller';
import { LessonAnnotation } from '../../entities/lesson-annotation.entity';
import { Lesson } from '../../entities/lesson.entity';
import { User } from '../../entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([LessonAnnotation, Lesson, User]), AuthModule],
  controllers: [AnnotationsController],
  providers: [AnnotationsService],
  exports: [AnnotationsService],
})
export class AnnotationsModule {}
