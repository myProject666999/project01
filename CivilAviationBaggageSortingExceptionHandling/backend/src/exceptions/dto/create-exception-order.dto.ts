import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateExceptionOrderDto {
  @IsNumber()
  baggage_id: number;

  @IsString()
  exception_type: string;

  @IsOptional()
  @IsString()
  description?: string;
}
