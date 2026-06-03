import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { CoursePackagesService } from './course-packages.service';
import { CreateCoursePackageDto } from './dto/create-course-package.dto';
import { UpdateCoursePackageDto } from './dto/update-course-package.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('course-packages')
@UseGuards(JwtAuthGuard)
export class CoursePackagesController {
  constructor(private readonly coursePackagesService: CoursePackagesService) {}

  @Post()
  create(@Body() createCoursePackageDto: CreateCoursePackageDto) {
    return this.coursePackagesService.create(createCoursePackageDto);
  }

  @Get()
  findAll() {
    return this.coursePackagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursePackagesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCoursePackageDto: UpdateCoursePackageDto) {
    return this.coursePackagesService.update(+id, updateCoursePackageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coursePackagesService.remove(+id);
  }
}
