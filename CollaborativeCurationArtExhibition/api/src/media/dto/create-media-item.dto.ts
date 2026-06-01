import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum } from 'class-validator';

export class CreateMediaItemDto {
  @IsNumber()
  @IsNotEmpty()
  exhibitionId: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(['poster', 'press_release', 'other'])
  @IsOptional()
  type?: 'poster' | 'press_release' | 'other';
}
