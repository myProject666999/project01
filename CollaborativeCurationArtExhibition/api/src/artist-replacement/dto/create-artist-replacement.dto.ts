import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum } from 'class-validator';

export class CreateArtistReplacementDto {
  @IsNumber()
  @IsNotEmpty()
  exhibitionId: number;

  @IsNumber()
  @IsNotEmpty()
  originalArtistId: number;

  @IsNumber()
  @IsOptional()
  replacementArtistId?: number;

  @IsEnum(['pending', 'approved', 'completed', 'rejected'])
  @IsOptional()
  status?: 'pending' | 'approved' | 'completed' | 'rejected';

  @IsString()
  @IsOptional()
  reason?: string;
}
