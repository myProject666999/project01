import { IsString, IsOptional } from 'class-validator';

export class CreateMediaVersionDto {
  @IsString()
  @IsOptional()
  uploadedBy?: string;
}
