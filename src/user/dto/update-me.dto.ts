import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateMeDto {
  @ApiPropertyOptional() @IsOptional() @IsString() firstName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() lastName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() country?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isTermsAccepted?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsString() paypalAddress?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() walletBTCAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  wireTransfer?: {
    firstName?: string;
    lastName?: string;
    accountNumber?: string;
    routingNumber?: string;
    bankName?: string;
    address?: string;
  };

  @ApiPropertyOptional()
  @IsOptional()
  zelleTransfer?: {
    recipientName?: string;
    email?: string;
    phone?: string;
  };

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: 'newStrongPass123',
    description: 'Новый пароль',
  })
  password?: string;
}
