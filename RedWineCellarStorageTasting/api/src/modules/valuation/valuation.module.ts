import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wine } from '@/entities/wine.entity';
import { Inventory } from '@/entities/inventory.entity';
import { ValuationController } from './valuation.controller';
import { ValuationService } from './valuation.service';

@Module({
  imports: [TypeOrmModule.forFeature([Wine, Inventory])],
  controllers: [ValuationController],
  providers: [ValuationService],
})
export class ValuationModule {}
