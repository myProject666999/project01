import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonAnnotation, AnnotationType } from '../../entities/lesson-annotation.entity';
import { Lesson } from '../../entities/lesson.entity';
import { User } from '../../entities/user.entity';
import { CreateAnnotationDto } from './dto/create-annotation.dto';
import { UpdateAnnotationDto } from './dto/update-annotation.dto';

@Injectable()
export class AnnotationsService {
  constructor(
    @InjectRepository(LessonAnnotation)
    private annotationRepository: Repository<LessonAnnotation>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findByLesson(lessonId: number): Promise<LessonAnnotation[]> {
    return this.annotationRepository.find({
      where: { lesson: { id: lessonId } },
      relations: ['lesson', 'createdBy'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: number): Promise<LessonAnnotation> {
    const annotation = await this.annotationRepository.findOne({
      where: { id },
      relations: ['lesson', 'createdBy'],
    });
    if (!annotation) {
      throw new NotFoundException(`Annotation with ID ${id} not found`);
    }
    return annotation;
  }

  async create(createAnnotationDto: CreateAnnotationDto): Promise<LessonAnnotation> {
    const lesson = await this.lessonRepository.findOne({ where: { id: createAnnotationDto.lessonId } });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${createAnnotationDto.lessonId} not found`);
    }

    const createdBy = await this.userRepository.findOne({ where: { id: createAnnotationDto.createdById } });
    if (!createdBy) {
      throw new NotFoundException(`User with ID ${createAnnotationDto.createdById} not found`);
    }

    const annotation = this.annotationRepository.create({
      content: createAnnotationDto.content,
      type: createAnnotationDto.type || AnnotationType.COMMENT,
      measure: createAnnotationDto.measure,
      timestamp: createAnnotationDto.timestamp,
      lesson,
      createdBy,
    });

    return this.annotationRepository.save(annotation);
  }

  async update(id: number, updateAnnotationDto: UpdateAnnotationDto): Promise<LessonAnnotation> {
    const annotation = await this.findOne(id);
    Object.assign(annotation, updateAnnotationDto);
    return this.annotationRepository.save(annotation);
  }

  async remove(id: number): Promise<void> {
    const result = await this.annotationRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Annotation with ID ${id} not found`);
    }
  }
}
