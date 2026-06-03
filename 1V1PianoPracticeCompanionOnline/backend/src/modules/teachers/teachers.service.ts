import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from '../../entities/teacher.entity';
import { TeacherSkill } from '../../entities/teacher-skill.entity';
import { User } from '../../entities/user.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(TeacherSkill)
    private skillRepository: Repository<TeacherSkill>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(page = 1, pageSize = 10): Promise<{ list: Teacher[]; total: number; page: number; pageSize: number }> {
    const [list, total] = await this.teacherRepository.findAndCount({
      relations: ['user', 'skills', 'bookings'],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { list, total, page, pageSize };
  }

  async findOne(id: number): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({
      where: { id },
      relations: ['user', 'skills', 'bookings'],
    });
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }
    return teacher;
  }

  async create(createTeacherDto: CreateTeacherDto): Promise<Teacher> {
    const user = await this.userRepository.findOne({ where: { id: createTeacherDto.userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${createTeacherDto.userId} not found`);
    }

    const teacher = this.teacherRepository.create({
      user,
      teachingYears: createTeacherDto.teachingYears,
      bio: createTeacherDto.bio,
      certifications: createTeacherDto.certifications,
      hourlyRate: createTeacherDto.hourlyRate,
      chineseTeaching: createTeacherDto.chineseTeaching,
      videoIntroUrl: createTeacherDto.videoIntroUrl,
      availableTimes: createTeacherDto.availableTimes,
    });

    const savedTeacher = await this.teacherRepository.save(teacher);

    if (createTeacherDto.skills && createTeacherDto.skills.length > 0) {
      for (const skillDto of createTeacherDto.skills) {
        const skill = this.skillRepository.create({
          difficultyLevel: skillDto.difficultyLevel,
          proficiencyLevel: skillDto.proficiencyLevel,
          teacher: savedTeacher,
        });
        await this.skillRepository.save(skill);
      }
    }

    return this.findOne(savedTeacher.id);
  }

  async update(id: number, updateTeacherDto: UpdateTeacherDto): Promise<Teacher> {
    const teacher = await this.findOne(id);
    Object.assign(teacher, {
      teachingYears: updateTeacherDto.teachingYears,
      bio: updateTeacherDto.bio,
      certifications: updateTeacherDto.certifications,
      hourlyRate: updateTeacherDto.hourlyRate,
      chineseTeaching: updateTeacherDto.chineseTeaching,
      videoIntroUrl: updateTeacherDto.videoIntroUrl,
      availableTimes: updateTeacherDto.availableTimes,
    });
    await this.teacherRepository.save(teacher);

    if (updateTeacherDto.skills) {
      await this.skillRepository.delete({ teacher: { id } });
      for (const skillDto of updateTeacherDto.skills) {
        const skill = this.skillRepository.create({
          difficultyLevel: skillDto.difficultyLevel,
          proficiencyLevel: skillDto.proficiencyLevel,
          teacher,
        });
        await this.skillRepository.save(skill);
      }
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.teacherRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }
  }
}
