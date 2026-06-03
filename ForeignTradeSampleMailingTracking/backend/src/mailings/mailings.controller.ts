import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { MailingsService } from './mailings.service';
import { Mailing } from '../entities/mailing.entity';

@Controller('mailings')
export class MailingsController {
  constructor(private readonly mailingsService: MailingsService) {}

  @Get()
  findAll(): Promise<Mailing[]> {
    return this.mailingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Mailing> {
    return this.mailingsService.findOne(+id);
  }

  @Post()
  create(@Body() mailingData: Partial<Mailing>): Promise<Mailing> {
    return this.mailingsService.create(mailingData);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() mailingData: Partial<Mailing>): Promise<Mailing> {
    return this.mailingsService.update(+id, mailingData);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.mailingsService.remove(+id);
  }

  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: any }): Promise<Mailing> {
    return this.mailingsService.updateStatus(+id, body.status);
  }
}
