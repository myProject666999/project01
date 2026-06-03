import { IsString, IsOptional, IsInt, IsNotEmpty } from 'class-validator';

export class UpdateDemandListDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
