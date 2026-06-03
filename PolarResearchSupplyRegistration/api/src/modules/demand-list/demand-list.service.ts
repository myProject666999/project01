import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DemandList, DemandListItem, Alert, Supply } from '../../entities';
import { UpdateDemandListItemDto, GenerateDemandListDto } from '../../dto/demand-list.dto';

@Injectable()
export class DemandListService {
  constructor(
    @InjectRepository(DemandList)
    private demandListRepo: Repository<DemandList>,
    @InjectRepository(DemandListItem)
    private demandListItemRepo: Repository<DemandListItem>,
    @InjectRepository(Alert)
    private alertRepo: Repository<Alert>,
    @InjectRepository(Supply)
    private supplyRepo: Repository<Supply>,
  ) {}

  findByVoyage(voyageId: number) {
    return this.demandListRepo.find({
      where: { voyageId },
      relations: ['items', 'items.supply', 'voyage'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateItem(id: number, dto: UpdateDemandListItemDto) {
    const item = await this.demandListItemRepo.findOne({ where: { id } });
    if (!item) throw new BadRequestException('Demand list item not found');

    item.requiredQuantity = dto.requiredQuantity;
    if (dto.remark) item.remark = dto.remark;

    await this.demandListItemRepo.save(item);
    return item;
  }

  async generateFromAlerts(dto: GenerateDemandListDto) {
    const alerts = await this.alertRepo.find({
      where: { resolved: false },
      relations: ['supply'],
    });

    if (alerts.length === 0) {
      throw new BadRequestException('No unresolved alerts found');
    }

    const name = dto.name || `需求清单-${new Date().toISOString().slice(0, 10)}`;

    const demandList = this.demandListRepo.create({
      name,
      voyageId: dto.voyageId,
    });
    const saved = await this.demandListRepo.save(demandList);

    const items = alerts.map(alert => {
      const daysToNextSupply = 90;
      const suggestedQuantity = Number(alert.dailyConsumption) * daysToNextSupply;

      return this.demandListItemRepo.create({
        demandListId: saved.id,
        supplyId: alert.supplyId,
        requiredQuantity: suggestedQuantity,
        suggestedQuantity,
      });
    });
    await this.demandListItemRepo.save(items);

    return this.demandListRepo.findOne({
      where: { id: saved.id },
      relations: ['items', 'items.supply', 'voyage'],
    });
  }
}
