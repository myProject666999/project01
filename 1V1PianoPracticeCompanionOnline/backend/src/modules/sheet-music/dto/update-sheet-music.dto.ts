import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { DifficultyLevel } from '../../../entities/teacher-skill.entity';
import { SheetMusicFileType } from '../../../entities/sheet-music.entity';

export class UpdateSheetMusicDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  composer?: string;

  @IsEnum(DifficultyLevel)
  @IsOptional()
  difficultyLevel?: DifficultyLevel;

  @IsEnum(SheetMusicFileType)
  @IsOptional()
  fileType?: SheetMusicFileType;

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsNumber()
  @IsOptional()
  pageCount?: number;

  @IsString()
  @IsOptional()
  description?: string;
}
