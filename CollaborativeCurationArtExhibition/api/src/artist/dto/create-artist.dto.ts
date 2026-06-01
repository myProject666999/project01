import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsEmail } from 'class-validator';

export class CreateArtistDto {
  @IsNumber()
  @IsNotEmpty()
  exhibitionId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(['pending', 'confirmed', 'withdrawn'])
  @IsOptional()
  confirmStatus?: 'pending' | 'confirmed' | 'withdrawn';
}
