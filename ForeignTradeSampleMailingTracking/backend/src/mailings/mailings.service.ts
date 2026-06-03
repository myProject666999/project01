import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mailing } from '../entities/mailing.entity';

@Injectable()
export class MailingsService {
  constructor(
    @InjectRepository(Mailing)
    private mailingsRepository: Repository<Mailing>,
  ) {}

  findAll(): Promise<Mailing[]> {
    return this.mailingsRepository.find({
      relations: {
        customer: true,
        sample: true,
        courier: true,
        feedback: true
      } as any
    });
  }

  async findOne(id: number): Promise<Mailing> {
    const mailing = await this.mailingsRepository.findOne({
      where: { id },
      relations: {
        customer: true,
        sample: true,
        courier: true,
        feedback: true
      } as any
    });
    if (!mailing) {
      throw new NotFoundException(`Mailing with ID ${id} not found`);
    }
    return mailing;
  }

  async create(mailingData: Partial<Mailing>): Promise<Mailing> {
    const mailing = this.mailingsRepository.create(mailingData);
    return this.mailingsRepository.save(mailing);
  }

  async update(id: number, mailingData: Partial<Mailing>): Promise<Mailing> {
    await this.mailingsRepository.update(id, mailingData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.mailingsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Mailing with ID ${id} not found`);
    }
  }

  async updateStatus(id: number, status: any): Promise<Mailing> {
    await this.mailingsRepository.update(id, { status });
    return this.findOne(id);
  }
}
