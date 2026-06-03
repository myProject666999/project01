import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoursePackage } from '../../entities/course-package.entity';
import { CreateCoursePackageDto } from './dto/create-course-package.dto';
import { UpdateCoursePackageDto } from './dto/update-course-package.dto';

@Injectable()
export class CoursePackagesService {
  constructor(
    @InjectRepository(CoursePackage)
    private coursePackageRepository: Repository<CoursePackage>,
  ) {}

  async findAll(): Promise<CoursePackage[]> {
    return this.coursePackageRepository.find({ relations: ['userPackages'] });
  }

  async findOne(id: number): Promise<CoursePackage> {
    const coursePackage = await this.coursePackageRepository.findOne({
      where: { id },
      relations: ['userPackages'],
    });
    if (!coursePackage) {
      throw new NotFoundException(`CoursePackage with ID ${id} not found`);
    }
    return coursePackage;
  }

  async create(createCoursePackageDto: CreateCoursePackageDto): Promise<CoursePackage> {
    const coursePackage = this.coursePackageRepository.create(createCoursePackageDto);
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
