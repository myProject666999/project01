import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Baggage } from '../entities/baggage.entity';
import { BaggageScanLog } from '../entities/baggage-scan-log.entity';
import { ExceptionOrder } from '../entities/exception-order.entity';
import { PassengerNotification } from '../entities/passenger-notification.entity';
import { PassengerQueryController } from './passenger-query.controller';
import { PassengerQueryService } from './passenger-query.service';

@Module({
  imports: [TypeOrmModule.forFeature([Baggage, BaggageScanLog, ExceptionOrder, PassengerNotification])],
  controllers: [PassengerQueryController],
  providers: [PassengerQueryService],
})
export class PassengerQueryModule {}
