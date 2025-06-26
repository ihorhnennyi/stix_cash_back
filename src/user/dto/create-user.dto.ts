import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Иван', description: 'Имя пользователя' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Иванов', description: 'Фамилия пользователя' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    example: 'ivan@example.com',
    description: 'Email пользователя',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '+380931234567',
    description: 'Телефон пользователя',
  })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: 'Украина', description: 'Страна пользователя' })
  @IsNotEmpty()
  @IsString()
  country: string;

  @ApiProperty({ example: 'superSecure123', description: 'Пароль' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ example: true, description: 'Согласие с условиями' })
  @IsBoolean()
  isTermsAccepted: boolean;
}
