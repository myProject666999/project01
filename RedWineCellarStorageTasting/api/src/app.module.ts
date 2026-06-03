import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WineModule } from './modules/wine/wine.module';
import { CellarModule } from './modules/cellar/cellar.module';
import { TastingModule } from './modules/tasting/tasting.module';
import { AlertModule } from './modules/alert/alert.module';
import { ValuationModule } from './modules/valuation/valuation.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'mysql' as const,
        host: '127.0.0.1',
        port: 3306,
        username: 'root',
        password: '123456',
        database: 'wine_cellar',
        autoLoadEntities: true,
        synchronize: false,
        extra: {
          decimalNumbers: true,
        },
      }),
    }),
    WineModule,
    CellarModule,
    TastingModule,
    AlertModule,
    ValuationModule,
  ],
})
export class AppModule {}
