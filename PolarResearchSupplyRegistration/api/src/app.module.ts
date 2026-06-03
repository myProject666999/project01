import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from './modules/category/category.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { SupplyModule } from './modules/supply/supply.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { VoyageModule } from './modules/voyage/voyage.module';
import { ProjectModule } from './modules/project/project.module';
import { MemberModule } from './modules/member/member.module';
import { RequisitionModule } from './modules/requisition/requisition.module';
import { AlertModule } from './modules/alert/alert.module';
import { StocktakingModule } from './modules/stocktaking/stocktaking.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { DemandListModule } from './modules/demand-list/demand-list.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        charset: 'utf8mb4_unicode_ci',
        autoLoadEntities: true,
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    CategoryModule,
    WarehouseModule,
    SupplyModule,
    InventoryModule,
    VoyageModule,
    ProjectModule,
    MemberModule,
    RequisitionModule,
    AlertModule,
    StocktakingModule,
    DashboardModule,
    DemandListModule,
  ],
})
export class AppModule {}
