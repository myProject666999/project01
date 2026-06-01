import { IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class BatchStatusItem {
  @IsNumber()
  id: number;

  @IsEnum(['shipped', 'in_transit', 'arrived', 'unpacked', 'hung', 'dismantled', 'returned'])
  transportStatus: 'shipped' | 'in_transit' | 'arrived' | 'unpacked' | 'hung' | 'dismantled' | 'returned';

  @IsString()
  @IsOptional()
  remark?: string;
}

export class BatchStatusDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchStatusItem)
  items: BatchStatusItem[];

  @IsString()
  @IsOptional()
  operator?: string;
}
