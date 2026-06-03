import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem, Alert, Requisition, Stocktaking, InventoryRecord, Voyage, StocktakingStatus, InventoryRecordType } from '../../entities';
import { ConsumptionTrendQueryDto } from '../../dto/dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(InventoryItem)
    private inventoryItemRepo: Repository<InventoryItem>,
    @InjectRepository(Alert)
    private alertRepo: Repository<Alert>,
    @InjectRepository(Requisition)
    private requisitionRepo: Repository<Requisition>,
    @InjectRepository(Stocktaking)
    private stocktakingRepo: Repository<Stocktaking>,
    @InjectRepository(InventoryRecord)
    private inventoryRecordRepo: Repository<InventoryRecord>,
    @InjectRepository(Voyage)
    private voyageRepo: Repository<Voyage>,
  ) {}

  async getStats() {
    const inventoryResult = await this.inventoryItemRepo
      .createQueryBuilder('inv')
      .select('SUM(inv.quantity)', 'total')
      .getRawOne();
    const totalInventory = Number(inventoryResult.total) || 0;

    const alertCount = await this.alertRepo.count({ where: { resolved: false } });

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyRequisitions = await this.requisitionRepo.count({
      where: { createdAt: monthStart as any },
    });

    const pendingStocktaking = await this.stocktakingRepo.count({
      where: { status: StocktakingStatus.PENDING },
    });

    return {
      totalInventory,
      alertCount,
      monthlyRequisitions,
      pendingStocktaking,
    };
  }

  getAlerts() {
    return this.alertRepo.find({
      where: { resolved: false },
      relations: ['supply'],
      order: { createdAt: 'DESC' },
      take: 5,
    });
  }

  async getConsumptionTrend(query: ConsumptionTrendQueryDto) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const records = await this.inventoryRecordRepo
      .createQueryBuilder('record')
      .select("DATE_FORMAT(record.createdAt, '%Y-%m')", 'month')
      .addSelect('record.type', 'type')
      .addSelect('SUM(record.quantity)', 'total')
      .where('record.createdAt >= :date', { date: sixMonthsAgo })
      .groupBy("DATE_FORMAT(record.createdAt, '%Y-%m')")
      .addGroupBy('record.type')
      .orderBy('month', 'ASC')
      .getRawMany();

    return records;
  }

  getRecentVoyages() {
    return this.voyageRepo.find({
      order: { createdAt: 'DESC' },
      take: 3,
    });
  }
}
