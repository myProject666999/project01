import { IsString, IsOptional, IsInt, IsNotEmpty, IsNumber, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PurposeType } from '../entities';

export class RequisitionItemDto {
  @IsInt()
  @IsNotEmpty()
  supplyId: number;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}

export class CreateRequisitionDto {
  @IsInt()
  @IsNotEmpty()
  memberId: number;

  @IsInt()
  @IsOptional()
  projectId?: number;

  @IsEnum(PurposeType)
  @IsOptional()
  purposeType?: PurposeType;

  @IsString()
  @IsOptional()
  remark?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequisitionItemDto)
  items: RequisitionItemDto[];
}

export class ApproveRequisitionDto {
  @IsInt()
  @IsNotEmpty()
  approvedBy: number;
}

export class RejectRequisitionDto {
  @IsInt()
  @IsNotEmpty()
  approvedBy: number;

  @IsString()
  @IsOptional()
  remark?: string;
}
