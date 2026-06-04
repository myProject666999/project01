import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { BaggagesModule } from './baggages/baggages.module';
import { SortingsModule } from './sortings/sortings.module';
import { ExceptionsModule } from './exceptions/exceptions.module';
import { PassengerQueryModule } from './passenger-query/passenger-query.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      username: 'root',
      password: '123456',
      database: 'civil_aviation_baggage',
      entities: [__dirname + '/entities/*.entity{.ts,.js}'],
      synchronize: false,
      charset: 'utf8mb4',
    }),
    BaggagesModule,
    SortingsModule,
    ExceptionsModule,
    PassengerQueryModule,
  ],
})
export class AppModule {}
