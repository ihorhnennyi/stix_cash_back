import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class WireTransferDto {
  @ApiPropertyOptional({
    example: 'John',
    description: 'First name of the account holder',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Doe',
    description: 'Last name of the account holder',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    example: '1234567890',
    description: 'Bank account number',
  })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiPropertyOptional({
    example: '987654321',
    description: 'Bank routing number',
  })
  @IsOptional()
  @IsString()
  routingNumber?: string;

  @ApiPropertyOptional({
    example: 'Bank of America',
    description: 'Name of the bank',
  })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional({
    example: '1234 Elm Street',
    description: 'Billing address',
  })
  @IsOptional()
  @IsString()
  address?: string;
}

export class ZelleTransferDto {
  @ApiPropertyOptional({
    example: 'Jane Doe',
    description: 'Recipient full name',
  })
  @IsOptional()
  @IsString()
  recipientName?: string;

  @ApiPropertyOptional({
    example: 'zelle@example.com',
    description: 'Zelle email address',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: '+1234567890',
    description: 'Zelle phone number',
  })
  @IsOptional()
  @IsString()
  phone?: string;
}
