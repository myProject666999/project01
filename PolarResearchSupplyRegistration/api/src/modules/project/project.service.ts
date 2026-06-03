import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from '../../entities';
import { CreateProjectDto, UpdateProjectDto } from '../../dto/project.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
  ) {}

  findAll() {
    return this.projectRepo.find({ relations: ['members'] });
  }

  findOne(id: number) {
    return this.projectRepo.findOne({ where: { id }, relations: ['members'] });
  }

  create(dto: CreateProjectDto) {
    const entity = this.projectRepo.create(dto);
    return this.projectRepo.save(entity);
  }

  async update(id: number, dto: UpdateProjectDto) {
    await this.projectRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.projectRepo.delete(id);
    return { deleted: true };
  }
}
