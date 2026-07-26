import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@qazaq-tas.kz' })
  @IsEmail({}, { message: 'Некорректный адрес электронной почты' })
  email: string;

  @ApiProperty({ example: 'QazaqTas2026!' })
  @IsString()
  @MinLength(6, { message: 'Пароль не короче 6 символов' })
  password: string;
}

export class RefreshDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}
