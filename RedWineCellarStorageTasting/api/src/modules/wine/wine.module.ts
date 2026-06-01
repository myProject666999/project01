import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wine } from '@/entities/wine.entity';
import { GrapeVariety } from '@/entities/grape-variety.entity';
import { Inventory } from '@/entities/inventory.entity';
import { WineController } from './wine.controller';
import { WineService } from './wine.service';

@Module({
  imports: [TypeOrmModule.forFeature([Wine, GrapeVariety, Inventory])],
  controllers: [WineController],
  providers: [WineService],
  exports: [WineService],
})
export class WineModule {}
