import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CellarSlot } from '@/entities/cellar-slot.entity';
import { Inventory } from '@/entities/inventory.entity';
import { CellarController } from './cellar.controller';
import { CellarService } from './cellar.service';

@Module({
  imports: [TypeOrmModule.forFeature([CellarSlot, Inventory])],
  controllers: [CellarController],
  providers: [CellarService],
  exports: [CellarService],
})
export class CellarModule {}
