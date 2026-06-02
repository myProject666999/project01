import { IsDateString, IsString, IsOptional, IsEnum } from 'class-validator';
import { BookingStatus } from '../../../entities/booking.entity';

export class UpdateBookingDto {
  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;
}
