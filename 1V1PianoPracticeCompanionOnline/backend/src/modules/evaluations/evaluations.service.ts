import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonEvaluation } from '../../entities/lesson-evaluation.entity';
import { Lesson } from '../../entities/lesson.entity';
import { Student } from '../../entities/student.entity';
import { Teacher } from '../../entities/teacher.entity';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';

@Injectable()
export class EvaluationsService {
  constructor(
    @InjectRepository(LessonEvaluation)
    private evaluationRepository: Repository<LessonEvaluation>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
  ) {}

  async findByLesson(lessonId: number): Promise<LessonEvaluation[]> {
    return this.evaluationRepository.find({
      where: { lesson: { id: lessonId } },
      relations: ['lesson', 'student', 'student.user', 'teacher', 'teacher.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStudent(studentId: number): Promise<LessonEvaluation[]> {
    return this.evaluationRepository.find({
      where: { student: { id: studentId } },
      relations: ['lesson', 'student', 'student.user', 'teacher', 'teacher.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByTeacher(teacherId: number): Promise<LessonEvaluation[]> {
    return this.evaluationRepository.find({
      where: { teacher: { id: teacherId } },
      relations: ['lesson', 'student', 'student.user', 'teacher', 'teacher.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<LessonEvaluation> {
    const evaluation = await this.evaluationRepository.findOne({
      where: { id },
      relations: ['lesson', 'student', 'student.user', 'teacher', 'teacher.user'],
    });
    if (!evaluation) {
      throw new NotFoundException(`Evaluation with ID ${id} not found`);
    }
    return evaluation;
  }

  async create(createEvaluationDto: CreateEvaluationDto): Promise<LessonEvaluation> {
    const lesson = await this.lessonRepository.findOne({ where: { id: createEvaluationDto.lessonId } });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${createEvaluationDto.lessonId} not found`);
    }

    let student = null;
    if (createEvaluationDto.studentId) {
      student = await this.studentRepository.findOne({ where: { id: createEvaluationDto.studentId } });
      if (!student) {
        throw new NotFoundException(`Student with ID ${createEvaluationDto.studentId} not found`);
      }
    }

    let teacher = null;
    if (createEvaluationDto.teacherId) {
      teacher = await this.teacherRepository.findOne({ where: { id: createEvaluationDto.teacherId } });
      if (!teacher) {
        throw new NotFoundException(`Teacher with ID ${createEvaluationDto.teacherId} not found`);
      }
    }

    const evaluation = this.evaluationRepository.create({
      rating: createEvaluationDto.rating,
      comment: createEvaluationDto.comment,
      from: createEvaluationDto.from,
      lesson,
      student,
      teacher,
    });

    const savedEvaluation = await this.evaluationRepository.save(evaluation);

    if (createEvaluationDto.from === 'student' && teacher) {
      const evaluations = await this.evaluationRepository.find({
        where: { teacher: { id: teacher.id } },
      });
      const totalRating = evaluations.reduce((sum, e) => sum + e.rating, 0);
      teacher.rating = totalRating / evaluations.length;
      await this.teacherRepository.save(teacher);
    }

    return savedEvaluation;
  }

  async update(id: number, updateEvaluationDto: UpdateEvaluationDto): Promise<LessonEvaluation> {
    const evaluation = await this.findOne(id);
    Object.assign(evaluation, updateEvaluationDto);
    return this.evaluationRepository.save(evaluation);
  }

  async remove(id: number): Promise<void> {
    const result = await this.evaluationRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Evaluation with ID ${id} not found`);
    }
  }
}
