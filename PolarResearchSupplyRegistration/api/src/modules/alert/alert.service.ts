import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert, InventoryRecord, InventoryItem, Supply, AlertLevel, InventoryRecordType } from '../../entities';

@Injectable()
export class AlertService {
  constructor(
    @InjectRepository(Alert)
    private alertRepo: Repository<Alert>,
    @InjectRepository(InventoryRecord)
    private inventoryRecordRepo: Repository<InventoryRecord>,
    @InjectRepository(InventoryItem)
    private inventoryItemRepo: Repository<InventoryItem>,
    @InjectRepository(Supply)
    private supplyRepo: Repository<Supply>,
  ) {}

  findAll() {
    return this.alertRepo.find({ relations: ['supply'], order: { createdAt: 'DESC' } });
  }

  async calculate() {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const outRecords = await this.inventoryRecordRepo
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.inventoryItem', 'invItem')
      .where('record.type = :type', { type: InventoryRecordType.OUT })
      .andWhere('record.createdAt >= :date', { date: threeMonthsAgo })
      .getMany();

    const consumptionBySupply = new Map<number, number>();
    for (const record of outRecords) {
      const supplyId = record.inventoryItem?.supplyId;
      if (!supplyId) continue;
      const current = consumptionBySupply.get(supplyId) || 0;
      consumptionBySupply.set(supplyId, current + Number(record.quantity));
    }

    const inventoryItems = await this.inventoryItemRepo.find();
    const stockBySupply = new Map<number, number>();
    for (const item of inventoryItems) {
      const current = stockBySupply.get(item.supplyId) || 0;
      stockBySupply.set(item.supplyId, current + Number(item.quantity));
    }

    const results: Alert[] = [];

    for (const [supplyId, totalConsumption] of consumptionBySupply) {
      const dailyConsumption = totalConsumption / 90;
      if (dailyConsumption <= 0) continue;

      const totalStock = stockBySupply.get(supplyId) || 0;
      const daysRemaining = totalStock / dailyConsumption;

      let level: AlertLevel;
      if (daysRemaining < 15) {
        level = AlertLevel.CRITICAL;
      } else if (daysRemaining < 30) {
        level = AlertLevel.WARNING;
      } else if (daysRemaining < 60) {
        level = AlertLevel.NOTICE;
      } else {
        continue;
      }

      const existing = await this.alertRepo.findOne({ where: { supplyId, resolved: false } });

      if (existing) {
        existing.dailyConsumption = dailyConsumption;
        existing.daysRemaining = daysRemaining;
        existing.level = level;
        await this.alertRepo.save(existing);
        results.push(existing);
      } else {
        const alert = this.alertRepo.create({
          supplyId,
          dailyConsumption,
          daysRemaining,
          level,
          resolved: false,
        });
        await this.alertRepo.save(alert);
        results.push(alert);
      }
    }

    return results;
  }

  async resolve(id: number) {
    const alert = await this.alertRepo.findOne({ where: { id } });
    if (!alert) return null;
    alert.resolved = true;
    await this.alertRepo.save(alert);
    return alert;
  }
}
