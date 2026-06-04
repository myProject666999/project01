import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { MaintenanceWorkOrder } from '../../entities/maintenance-work-order.entity';
import { MaintenancePlan } from '../../entities/maintenance-plan.entity';
import { Loom } from '../../entities/loom.entity';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([MaintenanceWorkOrder, MaintenancePlan, Loom]),
    ScheduleModule.forRoot(),
  ],
  controllers: [MaintenanceController],
  providers: [MaintenanceService],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
