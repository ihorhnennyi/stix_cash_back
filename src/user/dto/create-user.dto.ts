import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Ivan', description: 'User first name' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Ivanov', description: 'User last name' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    example: 'ivan@example.com',
    description: 'User email address',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '+380931234567',
    description: 'User phone number in international format',
    pattern: '^\\+\\d{10,15}$',
  })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: 'Ukraine', description: 'User country' })
  @IsNotEmpty()
  @IsString()
  country: string;

  @ApiProperty({ example: 'superSecure123', description: 'User password' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    example: true,
    description: 'User has accepted the terms and conditions',
    required: true,
  })
  @IsBoolean()
  isTermsAccepted: boolean;
}
