import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExceptionOrder } from '../entities/exception-order.entity';
import { Baggage } from '../entities/baggage.entity';
import { PassengerNotification } from '../entities/passenger-notification.entity';
import { ExceptionsController } from './exceptions.controller';
import { ExceptionsService } from './exceptions.service';

@Module({
  imports: [TypeOrmModule.forFeature([ExceptionOrder, Baggage, PassengerNotification])],
  controllers: [ExceptionsController],
  providers: [ExceptionsService],
  exports: [ExceptionsService],
})
export class ExceptionsModule {}
