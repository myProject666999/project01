import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateArtistReplacementDto {
  @IsEnum(['pending', 'approved', 'completed', 'rejected'])
  @IsOptional()
  status?: 'pending' | 'approved' | 'completed' | 'rejected';

  @IsString()
  @IsOptional()
  reason?: string;
}
