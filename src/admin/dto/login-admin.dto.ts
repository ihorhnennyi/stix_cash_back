import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginAdminDto {
  @ApiProperty({
    description: 'Email администратора',
    example: 'admin@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Пароль администратора',
    example: 'supersecret',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
