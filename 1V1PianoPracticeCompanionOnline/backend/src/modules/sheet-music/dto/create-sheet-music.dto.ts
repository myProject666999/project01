import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { DifficultyLevel } from '../../../entities/teacher-skill.entity';
import { SheetMusicFileType } from '../../../entities/sheet-music.entity';

export class CreateSheetMusicDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  composer?: string;

  @IsEnum(DifficultyLevel)
  @IsOptional()
  difficultyLevel?: DifficultyLevel;

  @IsEnum(SheetMusicFileType)
  fileType: SheetMusicFileType;

  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsNumber()
  @IsOptional()
  pageCount?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  createdById: number;
}
