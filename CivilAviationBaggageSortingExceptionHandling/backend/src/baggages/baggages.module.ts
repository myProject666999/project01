import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Baggage } from '../entities/baggage.entity';
import { BaggageScanLog } from '../entities/baggage-scan-log.entity';
import { BaggagesController } from './baggages.controller';
import { BaggagesService } from './baggages.service';

@Module({
  imports: [TypeOrmModule.forFeature([Baggage, BaggageScanLog])],
  controllers: [BaggagesController],
  providers: [BaggagesService],
  exports: [BaggagesService],
})
export class BaggagesModule {}
