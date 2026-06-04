import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import * as moment from 'moment';
import { DowntimeRecord } from '../../entities/downtime-record.entity';
import { DowntimeReason } from '../../entities/downtime-reason.entity';
import { Shift } from '../../entities/shift.entity';

@Injectable()
export class DowntimeService {
  constructor(
    @InjectRepository(DowntimeRecord)
    private readonly recordRepository: Repository<DowntimeRecord>,
    @InjectRepository(DowntimeReason)
    private readonly reasonRepository: Repository<DowntimeReason>,
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
  ) {}

  async getReasons(): Promise<DowntimeReason[]> {
    return await this.reasonRepository.find({ order: { category: 'ASC', reasonCode: 'ASC' } });
  }

  async createReason(data: Partial<DowntimeReason>): Promise<DowntimeReason> {
    const reason = this.reasonRepository.create(data);
    return await this.reasonRepository.save(reason);
  }

  async startDowntime(
    loomId: number,
    reasonId: number,
    operator?: string,
    remark?: string,
  ): Promise<DowntimeRecord> {
    const reason = await this.reasonRepository.findOne({ where: { id: reasonId } });
    if (!reason) {
      throw new NotFoundException(`停机原因 #${reasonId} 不存在`);
    }

    const now = new Date();
    const shiftInfo = this.getCurrentShift(now);

    const record = this.recordRepository.create({
      loomId,
      shiftId: shiftInfo?.shiftId,
      shiftDate: shiftInfo?.shiftDate,
      reasonId,
      startTime: now,
      operator,
      remark,
    });

    return await this.recordRepository.save(record);
  }

  async endDowntime(id: number, remark?: string): Promise<DowntimeRecord> {
    const record = await this.recordRepository.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException(`停机记录 #${id} 不存在`);
    }

    if (record.endTime) {
      return record;
    }

    const endTime = new Date();
    const durationMinutes = Math.round((endTime.getTime() - record.startTime.getTime()) / (1000 * 60));

    await this.recordRepository.update(id, {
      endTime,
      durationMinutes,
      remark: remark || record.remark,
    });

    return await this.recordRepository.findOne({ where: { id } });
  }

  async getRecords(
    loomId?: number,
    reasonId?: number,
    category?: string,
    startDate?: string,
    endDate?: string,
    page: number = 1,
    pageSize: number = 50,
  ): Promise<{ list: DowntimeRecord[]; total: number }> {
    const where: any = {};
    if (loomId) where.loomId = loomId;
    if (reasonId) where.reasonId = reasonId;
    if (startDate && endDate) {
      where.startTime = Between(moment(startDate).toDate(), moment(endDate).endOf('day').toDate()) as any;
    }

    const [list, total] = await this.recordRepository.findAndCount({
      where,
      order: { startTime: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { list, total };
  }

  async getRecord(id: number): Promise<DowntimeRecord> {
    const record = await this.recordRepository.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException(`停机记录 #${id} 不存在`);
    }
    return record;
  }

  async updateRecord(id: number, data: Partial<DowntimeRecord>): Promise<DowntimeRecord> {
    await this.getRecord(id);
    await this.recordRepository.update(id, data);
    return await this.getRecord(id);
  }

  async getDowntimeSummary(
    startDate: string,
    endDate: string,
    loomId?: number,
  ): Promise<{
    totalDowntimeMinutes: number;
    totalDowntimeCount: number;
    downtimeByCategory: Record<string, { minutes: number; count: number }>;
    downtimeByReason: Record<string, { minutes: number; count: number; reasonName: string }>;
    topReasons: Array<{ reasonId: number; reasonName: string; minutes: number; count: number }>;
  }> {
    const where: any = {
      startTime: Between(moment(startDate).toDate(), moment(endDate).endOf('day').toDate()) as any,
    };
    if (loomId) where.loomId = loomId;

    const records = await this.recordRepository.find({ where });
    const reasons = await this.reasonRepository.find();
    const reasonMap = new Map(reasons.map(r => [r.id, r]));

    const summary = {
      totalDowntimeMinutes: 0,
      totalDowntimeCount: records.length,
      downtimeByCategory: {} as Record<string, { minutes: number; count: number }>,
      downtimeByReason: {} as Record<string, { minutes: number; count: number; reasonName: string }>,
      topReasons: [] as Array<{ reasonId: number; reasonName: string; minutes: number; count: number }>,
    };

    for (const record of records) {
      const duration = record.durationMinutes || 0;
      const reason = reasonMap.get(record.reasonId);
      
      summary.totalDowntimeMinutes += duration;

      if (reason) {
        if (!summary.downtimeByCategory[reason.category]) {
          summary.downtimeByCategory[reason.category] = { minutes: 0, count: 0 };
        }
        summary.downtimeByCategory[reason.category].minutes += duration;
        summary.downtimeByCategory[reason.category].count++;

        if (!summary.downtimeByReason[reason.reasonCode]) {
          summary.downtimeByReason[reason.reasonCode] = { 
            minutes: 0, 
            count: 0, 
            reasonName: reason.reasonName 
          };
        }
        summary.downtimeByReason[reason.reasonCode].minutes += duration;
        summary.downtimeByReason[reason.reasonCode].count++;
      }
    }

    summary.topReasons = Object.entries(summary.downtimeByReason)
      .map(([code, data]) => {
        const reason = reasons.find(r => r.reasonCode === code);
        return {
          reasonId: reason?.id || 0,
          reasonName: data.reasonName,
          minutes: data.minutes,
          count: data.count,
        };
      })
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 10);

    return summary;
  }

  private getCurrentShift(time: Date): { shiftId: number; shiftDate: Date } | null {
    const hour = time.getHours();
    const minute = time.getMinutes();
    const totalMinutes = hour * 60 + minute;

    const shifts = [
      { id: 1, name: '早班', start: 8 * 60, end: 16 * 60 },
      { id: 2, name: '中班', start: 16 * 60, end: 24 * 60 },
      { id: 3, name: '晚班', start: 0 * 60, end: 8 * 60 },
    ];

    for (const shift of shifts) {
      if (totalMinutes >= shift.start && totalMinutes < shift.end) {
        let shiftDate = moment(time).format('YYYY-MM-DD');
        if (shift.id === 3 && totalMinutes < 8 * 60) {
          shiftDate = moment(time).subtract(1, 'day').format('YYYY-MM-DD');
        }
        return {
          shiftId: shift.id,
          shiftDate: moment(shiftDate).toDate(),
        };
      }
    }

    return null;
  }
}
