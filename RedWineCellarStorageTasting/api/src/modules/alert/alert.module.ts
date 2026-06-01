import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from '@/entities/inventory.entity';
import { AlertController } from './alert.controller';
import { AlertService } from './alert.service';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory])],
  controllers: [AlertController],
  providers: [AlertService],
})
export class AlertModule {}
