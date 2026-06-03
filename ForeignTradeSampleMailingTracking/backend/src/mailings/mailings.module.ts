import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mailing } from '../entities/mailing.entity';
import { MailingsService } from './mailings.service';
import { MailingsController } from './mailings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Mailing])],
  providers: [MailingsService],
  controllers: [MailingsController],
  exports: [MailingsService],
})
export class MailingsModule {}
