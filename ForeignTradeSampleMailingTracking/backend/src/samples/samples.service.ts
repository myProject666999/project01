import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sample } from '../entities/sample.entity';

@Injectable()
export class SamplesService {
  constructor(
    @InjectRepository(Sample)
    private samplesRepository: Repository<Sample>,
  ) {}

  findAll(): Promise<Sample[]> {
    return this.samplesRepository.find();
  }

  async findOne(id: number): Promise<Sample> {
    const sample = await this.samplesRepository.findOne({ where: { id } });
    if (!sample) {
      throw new NotFoundException(`Sample with ID ${id} not found`);
    }
    return sample;
  }

  async create(sampleData: Partial<Sample>): Promise<Sample> {
    const sample = this.samplesRepository.create(sampleData);
    return this.samplesRepository.save(sample);
  }

  async update(id: number, sampleData: Partial<Sample>): Promise<Sample> {
    await this.samplesRepository.update(id, sampleData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.samplesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Sample with ID ${id} not found`);
    }
  }
}
