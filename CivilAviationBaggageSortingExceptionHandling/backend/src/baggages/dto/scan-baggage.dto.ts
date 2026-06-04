import { IsString, IsOptional, Length } from 'class-validator';

export class ScanBaggageDto {
  @IsString()
  @Length(10, 10)
  tag_code: string;

  @IsString()
  scan_location: string;

  @IsOptional()
  @IsString()
  operator?: string;
}
