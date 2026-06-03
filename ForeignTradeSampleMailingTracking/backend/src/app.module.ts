import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { Sample } from './entities/sample.entity';
import { Courier } from './entities/courier.entity';
import { Customer } from './entities/customer.entity';
import { Mailing } from './entities/mailing.entity';
import { Feedback } from './entities/feedback.entity';
import { TrackingLog } from './entities/tracking-log.entity';
import { SamplesModule } from './samples/samples.module';
import { CouriersModule } from './couriers/couriers.module';
import { CustomersModule } from './customers/customers.module';
import { MailingsModule } from './mailings/mailings.module';
import { FeedbacksModule } from './feedbacks/feedbacks.module';
import { TrackingModule } from './tracking/tracking.module';
import { RoiModule } from './roi/roi.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '123456',
      database: process.env.DB_DATABASE || 'foreign_trade_sample_tracking',
      entities: [Sample, Courier, Customer, Mailing, Feedback, TrackingLog],
      synchronize: false,
      logging: false,
    }),
    ScheduleModule.forRoot(),
    SamplesModule,
    CouriersModule,
    CustomersModule,
    MailingsModule,
    FeedbacksModule,
    TrackingModule,
    RoiModule,
  ],
})
export class AppModule {}
