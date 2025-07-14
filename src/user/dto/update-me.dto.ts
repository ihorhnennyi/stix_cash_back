import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class WireTransferDto {
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

  @ApiPropertyOptional({ example: 'Bank of America', description: 'Bank name' })
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

class ZelleTransferDto {
  @ApiPropertyOptional({
    example: 'Jane Doe',
    description: 'Full name of recipient',
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

export class UpdateMeDto {
  @ApiPropertyOptional({ example: 'John', description: 'First name' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'Last name' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'USA', description: 'Country' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    example: 'john@example.com',
    description: 'Email address',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: true, description: 'Agreed to terms' })
  @IsOptional()
  @IsBoolean()
  isTermsAccepted?: boolean;

  @ApiPropertyOptional({
    example: 'paypal@example.com',
    description: 'PayPal address',
  })
  @IsOptional()
  @IsString()
  paypalAddress?: string;

  @ApiPropertyOptional({
    example: '1A2b3CbtcAddressHere',
    description: 'BTC wallet address',
  })
  @IsOptional()
  @IsString()
  walletBTCAddress?: string;

  @ApiPropertyOptional({
    type: () => WireTransferDto,
    description: 'Wire transfer information',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => WireTransferDto)
  wireTransfer?: WireTransferDto;

  @ApiPropertyOptional({
    type: () => ZelleTransferDto,
    description: 'Zelle transfer information',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ZelleTransferDto)
  zelleTransfer?: ZelleTransferDto;

  @ApiPropertyOptional({
    example: 'newStrongPass123',
    description: 'New password',
  })
  @IsOptional()
  @IsString()
  password?: string;
}
