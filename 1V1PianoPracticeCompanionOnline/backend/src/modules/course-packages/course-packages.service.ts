import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoursePackage } from '../../entities/course-package.entity';
import { Teacher } from '../../entities/teacher.entity';
import { CreateCoursePackageDto } from './dto/create-course-package.dto';
import { UpdateCoursePackageDto } from './dto/update-course-package.dto';

@Injectable()
export class CoursePackagesService {
  constructor(
    @InjectRepository(CoursePackage)
    private coursePackageRepository: Repository<CoursePackage>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
  ) {}

  async findAll(): Promise<CoursePackage[]> {
    return this.coursePackageRepository.find({ relations: ['teacher', 'teacher.user'] });
  }

  async findByTeacher(teacherId: number): Promise<CoursePackage[]> {
    return this.coursePackageRepository.find({
      where: { teacher: { id: teacherId } },
      relations: ['teacher', 'teacher.user'],
    });
  }

  async findOne(id: number): Promise<CoursePackage> {
    const coursePackage = await this.coursePackageRepository.findOne({
      where: { id },
      relations: ['teacher', 'teacher.user', 'userPackages'],
    });
    if (!coursePackage) {
      throw new NotFoundException(`CoursePackage with ID ${id} not found`);
    }
    return coursePackage;
  }

  async create(createCoursePackageDto: CreateCoursePackageDto): Promise<CoursePackage> {
    const teacher = await this.teacherRepository.findOne({ where: { id: createCoursePackageDto.teacherId } });
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${createCoursePackageDto.teacherId} not found`);
    }

    const coursePackage = this.coursePackageRepository.create({
      ...createCoursePackageDto,
      teacher,
    });

    return this.coursePackageRepository.save(coursePackage);
  }

  async update(id: number, updateCoursePackageDto: UpdateCoursePackageDto): Promise<CoursePackage> {
    const coursePackage = await this.findOne(id);
    Object.assign(coursePackage, updateCoursePackageDto);
    return this.coursePackageRepository.save(coursePackage);
  }

  async remove(id: number): Promise<void> {
    const result = await this.coursePackageRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`CoursePackage with ID ${id} not found`);
    }
  }
}
