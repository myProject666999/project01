import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Requisition, RequisitionItem, InventoryItem, InventoryRecord } from '../../entities';
import { RequisitionController } from './requisition.controller';
import { RequisitionService } from './requisition.service';

@Module({
  imports: [TypeOrmModule.forFeature([Requisition, RequisitionItem, InventoryItem, InventoryRecord])],
  controllers: [RequisitionController],
  providers: [RequisitionService],
  exports: [RequisitionService],
})
export class RequisitionModule {}
