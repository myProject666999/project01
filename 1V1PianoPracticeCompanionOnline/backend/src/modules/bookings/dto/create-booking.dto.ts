import { IsDateString, IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { BookingStatus } from '../../../entities/booking.entity';

export class CreateBookingDto {
  @IsDateString()
  scheduledStart: string;

  @IsDateString()
  scheduledEnd: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;

  @IsNumber()
  studentId: number;

  @IsNumber()
  teacherId: number;

  @IsNumber()
  userCoursePackageId: number;

  @IsNumber()
  @IsOptional()
  sheetMusicId?: number;
}
