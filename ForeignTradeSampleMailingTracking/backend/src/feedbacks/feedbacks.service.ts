import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from '../entities/feedback.entity';

@Injectable()
export class FeedbacksService {
  constructor(
    @InjectRepository(Feedback)
    private feedbacksRepository: Repository<Feedback>,
  ) {}

  findAll(): Promise<Feedback[]> {
    return this.feedbacksRepository.find({ relations: { mailing: true } as any });
  }

  async findOne(id: number): Promise<Feedback> {
    const feedback = await this.feedbacksRepository.findOne({
      where: { id },
      relations: { mailing: true } as any
    });
    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }
    return feedback;
  }

  async findByMailingId(mailingId: number): Promise<Feedback> {
    return this.feedbacksRepository.findOne({
      where: { mailing_id: mailingId },
      relations: { mailing: true } as any
    });
  }

  async create(feedbackData: Partial<Feedback>): Promise<Feedback> {
    const feedback = this.feedbacksRepository.create(feedbackData);
    return this.feedbacksRepository.save(feedback);
  }

  async update(id: number, feedbackData: Partial<Feedback>): Promise<Feedback> {
    await this.feedbacksRepository.update(id, feedbackData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.feedbacksRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }
  }
}
