import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sample } from '../entities/sample.entity';
import { Mailing } from '../entities/mailing.entity';
import { Feedback } from '../entities/feedback.entity';

export interface SampleROI {
  sampleId: number;
  model: string;
  totalMailings: number;
  totalCost: number;
  totalOrders: number;
  totalRevenue: number;
  conversionRate: number;
  averageOrderValue: number;
  roi: number;
}

@Injectable()
export class RoiService {
  constructor(
    @InjectRepository(Sample)
    private samplesRepository: Repository<Sample>,
    @InjectRepository(Mailing)
    private mailingsRepository: Repository<Mailing>,
    @InjectRepository(Feedback)
    private feedbacksRepository: Repository<Feedback>,
  ) {}

  async calculateSampleROI(): Promise<SampleROI[]> {
    const samples = await this.samplesRepository.find();
    const results: SampleROI[] = [];

    for (const sample of samples) {
      const mailings = await this.mailingsRepository.find({
        where: { sample_id: sample.id },
        relations: { feedback: true } as any
      });

      const totalMailings = mailings.length;
      const sampleUnitCost = parseFloat(sample.unit_cost.toString());
      const totalCost = totalMailings * sampleUnitCost;

      const orderedFeedbacks = mailings.filter(
        m => m.feedback && m.feedback.feedback_type === 'ordered'
      );

      const totalOrders = orderedFeedbacks.length;
      const totalRevenue = orderedFeedbacks.reduce(
        (sum, m) => sum + parseFloat(m.feedback.order_amount.toString()),
        0
      );

      const conversionRate = totalMailings > 0 ? (totalOrders / totalMailings) * 100 : 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const roi = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;

      results.push({
        sampleId: sample.id,
        model: sample.model,
        totalMailings,
        totalCost,
        totalOrders,
        totalRevenue,
        conversionRate,
        averageOrderValue,
        roi
      });
    }

    return results.sort((a, b) => b.roi - a.roi);
  }

  async getDashboardStats() {
    const totalMailings = await this.mailingsRepository.count();
    const deliveredMailings = await this.mailingsRepository.count({
      where: { status: 'delivered' }
    });
    
    const totalFeedbacks = await this.feedbacksRepository.count();
    const orderedFeedbacks = await this.feedbacksRepository.count({
      where: { feedback_type: 'ordered' }
    });

    const allFeedbacks = await this.feedbacksRepository.find({
      where: { feedback_type: 'ordered' }
    });

    const totalRevenue = allFeedbacks.reduce(
      (sum, f) => sum + parseFloat(f.order_amount.toString()),
      0
    );

    return {
      totalMailings,
      deliveredMailings,
      totalFeedbacks,
      orderedFeedbacks,
      totalRevenue,
      conversionRate: deliveredMailings > 0 ? (orderedFeedbacks / deliveredMailings) * 100 : 0
    };
  }
}
