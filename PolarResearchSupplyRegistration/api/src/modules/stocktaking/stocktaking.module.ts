import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stocktaking, StocktakingItem, InventoryItem } from '../../entities';
import { StocktakingController } from './stocktaking.controller';
import { StocktakingService } from './stocktaking.service';

@Module({
  imports: [TypeOrmModule.forFeature([Stocktaking, StocktakingItem, InventoryItem])],
  controllers: [StocktakingController],
  providers: [StocktakingService],
  exports: [StocktakingService],
})
export class StocktakingModule {}
