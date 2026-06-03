import { IsString, IsOptional, IsInt, IsNotEmpty, IsEnum } from 'class-validator';
import { MemberRole } from '../entities';

export class CreateMemberDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(MemberRole)
  @IsOptional()
  role?: MemberRole;

  @IsString()
  @IsOptional()
  team?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsInt()
  @IsOptional()
  projectId?: number;
}

export class UpdateMemberDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(MemberRole)
  @IsOptional()
  role?: MemberRole;

  @IsString()
  @IsOptional()
  team?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsInt()
  @IsOptional()
  projectId?: number;
}
