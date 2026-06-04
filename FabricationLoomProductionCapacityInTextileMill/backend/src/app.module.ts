import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { LoomModule } from './modules/loom/loom.module';
import { DataCollectionModule } from './modules/data-collection/data-collection.module';
import { OeeModule } from './modules/oee/oee.module';
import { ShiftReportModule } from './modules/shift-report/shift-report.module';
import { ProductionModule } from './modules/production/production.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { DowntimeModule } from './modules/downtime/downtime.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    LoomModule,
    DataCollectionModule,
    OeeModule,
    ShiftReportModule,
    ProductionModule,
    MaintenanceModule,
    DowntimeModule,
  ],
})
export class AppModule {}
