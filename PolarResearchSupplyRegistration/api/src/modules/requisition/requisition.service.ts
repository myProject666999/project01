import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Requisition, RequisitionItem, InventoryItem, InventoryRecord, RequisitionStatus, InventoryRecordType } from '../../entities';
import { CreateRequisitionDto, ApproveRequisitionDto, RejectRequisitionDto } from '../../dto/requisition.dto';

@Injectable()
export class RequisitionService {
  constructor(
    @InjectRepository(Requisition)
    private requisitionRepo: Repository<Requisition>,
    @InjectRepository(RequisitionItem)
    private requisitionItemRepo: Repository<RequisitionItem>,
    @InjectRepository(InventoryItem)
    private inventoryItemRepo: Repository<InventoryItem>,
    @InjectRepository(InventoryRecord)
    private inventoryRecordRepo: Repository<InventoryRecord>,
    private dataSource: DataSource,
  ) {}

  findAll() {
    return this.requisitionRepo.find({ relations: ['member', 'project', 'items', 'items.supply'], order: { createdAt: 'DESC' } });
  }

  findOne(id: number) {
    return this.requisitionRepo.findOne({ where: { id }, relations: ['member', 'project', 'items', 'items.supply'] });
  }

  async create(dto: CreateRequisitionDto) {
    const date = new Date();
    const dateStr = date.getFullYear().toString() +
      String(date.getMonth() + 1).padStart(2, '0') +
      String(date.getDate()).padStart(2, '0');

    const count = await this.requisitionRepo.count({
      where: { reqNo: new RegExp(`^REQ-${dateStr}-`) } as any,
    });
    const seq = String(count + 1).padStart(3, '0');
    const reqNo = `REQ-${dateStr}-${seq}`;

    const requisition = this.requisitionRepo.create({
      reqNo,
      memberId: dto.memberId,
      projectId: dto.projectId,
      purposeType: dto.purposeType,
      remark: dto.remark,
    });
    const saved = await this.requisitionRepo.save(requisition);

    const items = dto.items.map(item =>
      this.requisitionItemRepo.create({
        requisitionId: saved.id,
        supplyId: item.supplyId,
        quantity: item.quantity,
      }),
    );
    await this.requisitionItemRepo.save(items);

    return this.findOne(saved.id);
  }

  async approve(id: number, dto: ApproveRequisitionDto) {
    const requisition = await this.requisitionRepo.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!requisition) throw new BadRequestException('Requisition not found');
    if (requisition.status !== RequisitionStatus.PENDING) throw new BadRequestException('Requisition is not pending');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of requisition.items) {
        const invItems = await queryRunner.manager.find(InventoryItem, {
          where: { supplyId: item.supplyId },
        });

        let remaining = Number(item.quantity);
        for (const inv of invItems) {
          if (remaining <= 0) break;
          const available = Number(inv.quantity) - Number(inv.reservedQuantity);
          if (available <= 0) continue;

          const deduct = Math.min(available, remaining);
          inv.quantity = Number(inv.quantity) - deduct;
          inv.lastStockOut = new Date();
          await queryRunner.manager.save(InventoryItem, inv);

          const record = queryRunner.manager.create(InventoryRecord, {
            inventoryItemId: inv.id,
            type: InventoryRecordType.OUT,
            quantity: deduct,
            sourceType: 'requisition',
            sourceId: requisition.id,
          });
          await queryRunner.manager.save(InventoryRecord, record);

          remaining -= deduct;
        }

        if (remaining > 0) {
          throw new BadRequestException(`Insufficient stock for supply ${item.supplyId}`);
        }
      }

      requisition.status = RequisitionStatus.APPROVED;
      requisition.approvedBy = dto.approvedBy;
      requisition.approvedAt = new Date();
      await queryRunner.manager.save(Requisition, requisition);

      await queryRunner.commitTransaction();
      return this.findOne(id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async reject(id: number, dto: RejectRequisitionDto) {
    const requisition = await this.requisitionRepo.findOne({ where: { id } });
    if (!requisition) throw new BadRequestException('Requisition not found');
    if (requisition.status !== RequisitionStatus.PENDING) throw new BadRequestException('Requisition is not pending');

    requisition.status = RequisitionStatus.REJECTED;
    requisition.approvedBy = dto.approvedBy;
    requisition.approvedAt = new Date();
    if (dto.remark) requisition.remark = dto.remark;

    await this.requisitionRepo.save(requisition);
    return this.findOne(id);
  }
}
