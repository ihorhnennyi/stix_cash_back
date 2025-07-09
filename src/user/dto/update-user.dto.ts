import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { WireTransferDto, ZelleTransferDto } from './transfer-info.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    example: '1A2b3CbtcAddressHere',
    description: 'BTC-кошелёк',
  })
  @IsOptional()
  @IsString()
  walletBTCAddress?: string;

  @ApiPropertyOptional({
    example: 'paypal@example.com',
    description: 'PayPal адрес',
  })
  @IsOptional()
  @IsString()
  paypalAddress?: string;

  @ApiPropertyOptional({
    description: 'Информация для банковского перевода (Wire)',
    type: () => WireTransferDto,
  })
  @IsOptional()
  @Type(() => WireTransferDto)
  wireTransfer?: WireTransferDto;

  @ApiPropertyOptional({
    description: 'Информация для Zelle перевода',
    type: () => ZelleTransferDto,
  })
  @IsOptional()
  @Type(() => ZelleTransferDto)
  zelleTransfer?: ZelleTransferDto;
}
