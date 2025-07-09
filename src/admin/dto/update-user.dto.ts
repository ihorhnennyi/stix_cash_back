import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import {
  WireTransferDto,
  ZelleTransferDto,
} from '../../user/dto/transfer-info.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    example: '1A2b3CbtcAddressHere',
    description: 'BTC-кошелёк',
  })
  walletBTCAddress?: string;

  @ApiPropertyOptional({
    example: 'paypal@example.com',
    description: 'Адрес PayPal',
  })
  paypalAddress?: string;

  @ApiPropertyOptional({
    description: 'Информация для банковского перевода (wire)',
    type: () => WireTransferDto,
  })
  @Type(() => WireTransferDto)
  wireTransfer?: WireTransferDto;

  @ApiPropertyOptional({
    description: 'Информация для перевода через Zelle',
    type: () => ZelleTransferDto,
  })
  @Type(() => ZelleTransferDto)
  zelleTransfer?: ZelleTransferDto;
}
