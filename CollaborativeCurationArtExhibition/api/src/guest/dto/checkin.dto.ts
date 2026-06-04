import { IsEnum, IsNotEmpty } from 'class-validator';

export class CheckinDto {
  @IsEnum(['qrcode', 'face', 'manual'])
  @IsNotEmpty()
  method: 'qrcode' | 'face' | 'manual';
}
