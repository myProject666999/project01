import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voyage } from '../../entities/voyage.entity';
import { VoyageSupply } from '../../entities/voyage-supply.entity';
import { InventoryItem } from '../../entities/inventory-item.entity';
import { InventoryRecord } from '../../entities/inventory-record.entity';
import { VoyageController } from './voyage.controller';
import { VoyageService } from './voyage.service';

@Module({
  imports: [TypeOrmModule.forFeature([Voyage, VoyageSupply, InventoryItem, InventoryRecord])],
  controllers: [VoyageController],
  providers: [VoyageService],
  exports: [VoyageService],
})
export class VoyageModule {}
