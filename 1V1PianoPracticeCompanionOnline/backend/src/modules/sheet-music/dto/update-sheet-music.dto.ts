import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateSheetMusicDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  artist?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsString()
  @IsOptional()
  difficulty?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
