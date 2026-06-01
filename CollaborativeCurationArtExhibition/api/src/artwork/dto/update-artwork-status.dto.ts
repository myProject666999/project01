import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateArtworkStatusDto {
  @IsEnum(['shipped', 'in_transit', 'arrived', 'unpacked', 'hung', 'dismantled', 'returned'])
  transportStatus: 'shipped' | 'in_transit' | 'arrived' | 'unpacked' | 'hung' | 'dismantled' | 'returned';

  @IsString()
  @IsOptional()
  remark?: string;

  @IsString()
  @IsOptional()
  operator?: string;
}
