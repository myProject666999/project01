import { IsString, IsOptional } from 'class-validator';

export class CreateSortingPortDto {
  @IsString()
  port_code: string;

  @IsString()
  port_name: string;

  @IsOptional()
  @IsString()
  status?: string;
}
