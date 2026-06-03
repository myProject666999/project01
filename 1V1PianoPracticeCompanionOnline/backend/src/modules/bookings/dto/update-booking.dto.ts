import { IsDateString, IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { BookingStatus } from '../../../entities/booking.entity';

export class UpdateBookingDto {
  @IsDateString()
  @IsOptional()
  scheduledStart?: string;

  @IsDateString()
  @IsOptional()
  scheduledEnd?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;

  @IsString()
  @IsOptional()
  cancellationReason?: string;

  @IsNumber()
  @IsOptional()
  cancelledBy?: number;

  @IsDateString()
  @IsOptional()
  cancelledAt?: string;

  @IsNumber()
  @IsOptional()
  sheetMusicId?: number;
}
