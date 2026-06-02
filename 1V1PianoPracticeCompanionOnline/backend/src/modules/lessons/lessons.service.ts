import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson, LessonStatus } from '../../entities/lesson.entity';
import { Booking } from '../../entities/booking.entity';
import { SheetMusic } from '../../entities/sheet-music.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(SheetMusic)
    private sheetMusicRepository: Repository<SheetMusic>,
  ) {}

  async findAll(): Promise<Lesson[]> {
    return this.lessonRepository.find({
      relations: ['booking', 'booking.student', 'booking.teacher', 'sheetMusic', 'annotations', 'evaluations', 'recordings'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStudent(studentId: number): Promise<Lesson[]> {
    return this.lessonRepository.find({
      where: { booking: { student: { id: studentId } } },
      relations: ['booking', 'booking.student', 'booking.teacher', 'sheetMusic', 'annotations', 'evaluations', 'recordings'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByTeacher(teacherId: number): Promise<Lesson[]> {
    return this.lessonRepository.find({
      where: { booking: { teacher: { id: teacherId } } },
      relations: ['booking', 'booking.student', 'booking.teacher', 'sheetMusic', 'annotations', 'evaluations', 'recordings'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { id },
      relations: ['booking', 'booking.student', 'booking.student.user', 'booking.teacher', 'booking.teacher.user', 'sheetMusic', 'annotations', 'annotations.createdBy', 'evaluations', 'recordings'],
    });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
    return lesson;
  }

  async create(createLessonDto: CreateLessonDto): Promise<Lesson> {
    const booking = await this.bookingRepository.findOne({ where: { id: createLessonDto.bookingId } });
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${createLessonDto.bookingId} not found`);
    }

    let sheetMusic = null;
    if (createLessonDto.sheetMusicId) {
      sheetMusic = await this.sheetMusicRepository.findOne({ where: { id: createLessonDto.sheetMusicId } });
      if (!sheetMusic) {
        throw new NotFoundException(`SheetMusic with ID ${createLessonDto.sheetMusicId} not found`);
      }
    }

    const lesson = this.lessonRepository.create({
      lessonPlan: createLessonDto.lessonPlan,
      status: createLessonDto.status || LessonStatus.NOT_STARTED,
      booking,
      sheetMusic,
    });

    return this.lessonRepository.save(lesson);
  }

  async update(id: number, updateLessonDto: UpdateLessonDto): Promise<Lesson> {
    const lesson = await this.findOne(id);

    if (updateLessonDto.sheetMusicId) {
      const sheetMusic = await this.sheetMusicRepository.findOne({ where: { id: updateLessonDto.sheetMusicId } });
      if (!sheetMusic) {
        throw new NotFoundException(`SheetMusic with ID ${updateLessonDto.sheetMusicId} not found`);
      }
      lesson.sheetMusic = sheetMusic;
    }

    if (updateLessonDto.actualStartTime) {
      lesson.actualStartTime = new Date(updateLessonDto.actualStartTime);
    }
    if (updateLessonDto.actualEndTime) {
      lesson.actualEndTime = new Date(updateLessonDto.actualEndTime);
    }

    Object.assign(lesson, updateLessonDto);
    return this.lessonRepository.save(lesson);
  }

  async remove(id: number): Promise<void> {
    const result = await this.lessonRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
  }
}
