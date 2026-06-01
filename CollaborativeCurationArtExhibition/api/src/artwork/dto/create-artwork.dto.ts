import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum } from 'class-validator';

export class CreateArtworkDto {
  @IsNumber()
  @IsNotEmpty()
  exhibitionId: number;

  @IsNumber()
  @IsNotEmpty()
  artistId: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  medium?: string;

  @IsString()
  @IsOptional()
  dimensions?: string;

  @IsNumber()
  @IsOptional()
  year?: number;

  @IsEnum(['shipped', 'in_transit', 'arrived', 'unpacked', 'hung', 'dismantled', 'returned'])
  @IsOptional()
  transportStatus?: 'shipped' | 'in_transit' | 'arrived' | 'unpacked' | 'hung' | 'dismantled' | 'returned';
}
