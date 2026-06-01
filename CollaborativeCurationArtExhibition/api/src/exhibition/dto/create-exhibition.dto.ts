import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsNumber } from 'class-validator';

export class CreateExhibitionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  venue: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsEnum(['planning', 'preparing', 'installing', 'open', 'closed', 'dismantling'])
  @IsOptional()
  status?: 'planning' | 'preparing' | 'installing' | 'open' | 'closed' | 'dismantling';

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsNumber()
  @IsNotEmpty()
  curatorId: number;
}
