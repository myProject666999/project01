import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemandList, DemandListItem, Alert, Supply } from '../../entities';
import { DemandListController } from './demand-list.controller';
import { DemandListService } from './demand-list.service';

@Module({
  imports: [TypeOrmModule.forFeature([DemandList, DemandListItem, Alert, Supply])],
  controllers: [DemandListController],
  providers: [DemandListService],
  exports: [DemandListService],
})
export class DemandListModule {}
