import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEmail,
  IsEnum,
} from 'class-validator';

export class CreateGuestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(['vvip', 'vip', 'media', 'general'])
  @IsOptional()
  category?: 'vvip' | 'vip' | 'media' | 'general';

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  organization?: string;

  @IsEnum(['pending', 'sent', 'accepted', 'declined'])
  @IsOptional()
  inviteStatus?: 'pending' | 'sent' | 'accepted' | 'declined';

  @IsNumber()
  @IsNotEmpty()
  exhibitionId: number;
}
