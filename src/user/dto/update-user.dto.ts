import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { WireTransferDto, ZelleTransferDto } from './transfer-info.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    example: '1A2b3CbtcAddressHere',
    description: 'BTC-кошелёк',
  })
  @IsOptional()
  walletBTCAddress?: string;

  @ApiPropertyOptional({
    example: 'paypal@example.com',
    description: 'PayPal адрес',
  })
  @IsOptional()
  paypalAddress?: string;

  @ApiPropertyOptional({ description: 'Инфо по банковскому переводу (Wire)' })
  @IsOptional()
  wireTransfer?: WireTransferDto;

  @ApiPropertyOptional({ description: 'Инфо для перевода Zelle' })
  @IsOptional()
  zelleTransfer?: ZelleTransferDto;

  @ApiPropertyOptional({
    example: true,
    description: 'Пользователь верифицирован?',
  })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Показывать баланс в BTC',
  })
  @IsOptional()
  @IsBoolean()
  showBTCBalance?: boolean;
}
