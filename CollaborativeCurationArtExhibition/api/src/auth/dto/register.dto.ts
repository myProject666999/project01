import { IsString, IsNotEmpty, IsEmail, IsEnum } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(['curator', 'artist', 'worker', 'media'])
  role?: 'curator' | 'artist' | 'worker' | 'media';
}
