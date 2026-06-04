import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionOrder } from '../../entities/production-order.entity';
import { ProductionSchedule } from '../../entities/production-schedule.entity';
import { LoomExecutionQueue } from '../../entities/loom-execution-queue.entity';
import { Loom } from '../../entities/loom.entity';
import { FabricSpec } from '../../entities/fabric-spec.entity';
import { ProductionService } from './production.service';
import { ProductionController } from './production.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductionOrder,
      ProductionSchedule,
      LoomExecutionQueue,
      Loom,
      FabricSpec,
    ]),
  ],
  controllers: [ProductionController],
  providers: [ProductionService],
  exports: [ProductionService],
})
export class ProductionModule {}
