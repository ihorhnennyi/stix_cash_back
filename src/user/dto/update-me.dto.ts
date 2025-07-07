// src/user/dto/update-me.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateMeDto {
  @ApiPropertyOptional({ example: 'Иван', description: 'Имя' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Иванов', description: 'Фамилия' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: '+380931234567', description: 'Телефон' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Украина', description: 'Страна' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 'new@email.com', description: 'Email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: true, description: 'Согласие с условиями' })
  @IsOptional()
  @IsBoolean()
  isTermsAccepted?: boolean;

  @ApiPropertyOptional({ description: 'Адрес PayPal' })
  @IsOptional()
  @IsString()
  paypalAddress?: string;

  @ApiPropertyOptional({ description: 'BTC-кошелёк' })
  @IsOptional()
  @IsString()
  walletBTCAddress?: string;

  @ApiPropertyOptional({ description: 'Wire Transfer Info' })
  @IsOptional()
  wireTransfer?: {
    firstName?: string;
    lastName?: string;
    accountNumber?: string;
    routingNumber?: string;
    bankName?: string;
    address?: string;
  };

  @ApiPropertyOptional({ description: 'Zelle Transfer Info' })
  @IsOptional()
  zelleTransfer?: {
    recipientName?: string;
    email?: string;
    phone?: string;
  };
}
