import { IsString, IsOptional } from 'class-validator';

export class UpdateExceptionOrderDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  handler?: string;

  @IsOptional()
  @IsString()
  resolution?: string;
}
