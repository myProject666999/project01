import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { AnnotationsService } from './annotations.service';
import { CreateAnnotationDto } from './dto/create-annotation.dto';
import { UpdateAnnotationDto } from './dto/update-annotation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('annotations')
@UseGuards(JwtAuthGuard)
export class AnnotationsController {
  constructor(private readonly annotationsService: AnnotationsService) {}

  @Post()
  create(@Body() createAnnotationDto: CreateAnnotationDto) {
    return this.annotationsService.create(createAnnotationDto);
  }

  @Get()
  findByLesson(@Query('lessonId') lessonId: string) {
    return this.annotationsService.findByLesson(+lessonId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.annotationsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAnnotationDto: UpdateAnnotationDto) {
    return this.annotationsService.update(+id, updateAnnotationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.annotationsService.remove(+id);
  }
}
