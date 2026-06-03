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

    const student = await this.studentRepository.findOne({ where: { id: createEvaluationDto.studentId } });
    if (!student) {
      throw new NotFoundException(`Student with ID ${createEvaluationDto.studentId} not found`);
    }

    const teacher = await this.teacherRepository.findOne({ where: { id: createEvaluationDto.teacherId } });
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${createEvaluationDto.teacherId} not found`);
    }

    const evaluation = this.evaluationRepository.create({
      rhythmScore: createEvaluationDto.rhythmScore,
      rhythmComment: createEvaluationDto.rhythmComment,
      intonationScore: createEvaluationDto.intonationScore,
      intonationComment: createEvaluationDto.intonationComment,
      expressionScore: createEvaluationDto.expressionScore,
      expressionComment: createEvaluationDto.expressionComment,
      accuracyScore: createEvaluationDto.accuracyScore,
      accuracyComment: createEvaluationDto.accuracyComment,
      overallComment: createEvaluationDto.overallComment,
      nextGoal: createEvaluationDto.nextGoal,
      practiceAssignments: createEvaluationDto.practiceAssignments,
      lesson,
      student,
      teacher,
    });

    return this.evaluationRepository.save(evaluation);
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
