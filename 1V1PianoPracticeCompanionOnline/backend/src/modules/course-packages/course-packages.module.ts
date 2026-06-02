import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursePackagesService } from './course-packages.service';
import { CoursePackagesController } from './course-packages.controller';
import { CoursePackage } from '../../entities/course-package.entity';
import { UserCoursePackage } from '../../entities/user-course-package.entity';
import { Teacher } from '../../entities/teacher.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([CoursePackage, UserCoursePackage, Teacher]), AuthModule],
  controllers: [CoursePackagesController],
  providers: [CoursePackagesService],
  exports: [CoursePackagesService],
})
export class CoursePackagesModule {}
