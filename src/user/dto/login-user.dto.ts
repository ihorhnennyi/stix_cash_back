import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'supersecurepassword',
    description: 'User password',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
