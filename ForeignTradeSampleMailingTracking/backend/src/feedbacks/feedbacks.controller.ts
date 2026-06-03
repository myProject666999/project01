import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { FeedbacksService } from './feedbacks.service';
import { Feedback } from '../entities/feedback.entity';

@Controller('feedbacks')
export class FeedbacksController {
  constructor(private readonly feedbacksService: FeedbacksService) {}

  @Get()
  findAll(): Promise<Feedback[]> {
    return this.feedbacksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Feedback> {
    return this.feedbacksService.findOne(+id);
  }

  @Get('mailing/:mailingId')
  findByMailingId(@Param('mailingId') mailingId: string): Promise<Feedback> {
    return this.feedbacksService.findByMailingId(+mailingId);
  }

  @Post()
  create(@Body() feedbackData: Partial<Feedback>): Promise<Feedback> {
    return this.feedbacksService.create(feedbackData);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() feedbackData: Partial<Feedback>): Promise<Feedback> {
    return this.feedbacksService.update(+id, feedbackData);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.feedbacksService.remove(+id);
  }
}
