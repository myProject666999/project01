import { IsString } from 'class-validator';

export class PassengerQueryDto {
  @IsString()
  name: string;

  @IsString()
  tag_code: string;
}
