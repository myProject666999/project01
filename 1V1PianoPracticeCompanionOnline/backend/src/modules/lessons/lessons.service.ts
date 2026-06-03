import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson, LessonStatus } from '../../entities/lesson.entity';
import { Booking } from '../../entities/booking.entity';
import { Student } from '../../entities/student.entity';
import { Teacher } from '../../entities/teacher.entity';
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
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(SheetMusic)
    private sheetMusicRepository: Repository<SheetMusic>,
  ) {}

  async findAll(): Promise<Lesson[]> {
    return this.lessonRepository.find({
      relations: ['booking', 'student', 'student.user', 'teacher', 'teacher.user', 'sheetMusic', 'annotations', 'evaluations', 'recordings'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStudent(studentId: number): Promise<Lesson[]> {
    return this.lessonRepository.find({
      where: { student: { id: studentId } },
      relations: ['booking', 'student', 'student.user', 'teacher', 'teacher.user', 'sheetMusic', 'annotations', 'evaluations', 'recordings'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByTeacher(teacherId: number): Promise<Lesson[]> {
    return this.lessonRepository.find({
      where: { teacher: { id: teacherId } },
      relations: ['booking', 'student', 'student.user', 'teacher', 'teacher.user', 'sheetMusic', 'annotations', 'evaluations', 'recordings'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { id },
      relations: ['booking', 'student', 'student.user', 'teacher', 'teacher.user', 'sheetMusic', 'annotations', 'annotations.creator', 'evaluations', 'recordings'],
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

    const student = await this.studentRepository.findOne({ where: { id: createLessonDto.studentId } });
    if (!student) {
      throw new NotFoundException(`Student with ID ${createLessonDto.studentId} not found`);
    }

    const teacher = await this.teacherRepository.findOne({ where: { id: createLessonDto.teacherId } });
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${createLessonDto.teacherId} not found`);
    }

    let sheetMusic = null;
    if (createLessonDto.sheetMusicId) {
      sheetMusic = await this.sheetMusicRepository.findOne({ where: { id: createLessonDto.sheetMusicId } });
      if (!sheetMusic) {
        throw new NotFoundException(`SheetMusic with ID ${createLessonDto.sheetMusicId} not found`);
      }
    }

    const lesson = this.lessonRepository.create({
      status: createLessonDto.status || LessonStatus.NOT_STARTED,
      roomId: createLessonDto.roomId,
      teacherVideoUrl: createLessonDto.teacherVideoUrl,
      studentVideoUrl: createLessonDto.studentVideoUrl,
      actualStart: createLessonDto.actualStart ? new Date(createLessonDto.actualStart) : null,
      actualEnd: createLessonDto.actualEnd ? new Date(createLessonDto.actualEnd) : null,
      booking,
      student,
      teacher,
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

    if (updateLessonDto.actualStart) {
      lesson.actualStart = new Date(updateLessonDto.actualStart);
    }
    if (updateLessonDto.actualEnd) {
      lesson.actualEnd = new Date(updateLessonDto.actualEnd);
    }

    Object.assign(lesson, {
      status: updateLessonDto.status,
      roomId: updateLessonDto.roomId,
      teacherVideoUrl: updateLessonDto.teacherVideoUrl,
      studentVideoUrl: updateLessonDto.studentVideoUrl,
    });
    return this.lessonRepository.save(lesson);
  }

  async remove(id: number): Promise<void> {
    const result = await this.lessonRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
  }
}
