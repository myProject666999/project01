import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SortingPort } from '../entities/sorting-port.entity';
import { SortingRule } from '../entities/sorting-rule.entity';
import { SortingsController } from './sortings.controller';
import { SortingsService } from './sortings.service';

@Module({
  imports: [TypeOrmModule.forFeature([SortingPort, SortingRule])],
  controllers: [SortingsController],
  providers: [SortingsService],
  exports: [SortingsService],
})
export class SortingsModule {}
