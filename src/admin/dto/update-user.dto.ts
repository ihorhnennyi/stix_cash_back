import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateUserDto } from '../../user/dto/create-user.dto';

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

export class WireTransferDto {
  @ApiPropertyOptional({ example: 'John' }) firstName?: string;
  @ApiPropertyOptional({ example: 'Doe' }) lastName?: string;
  @ApiPropertyOptional({ example: '1234567890' }) accountNumber?: string;
  @ApiPropertyOptional({ example: '987654321' }) routingNumber?: string;
  @ApiPropertyOptional({ example: 'Bank of America' }) bankName?: string;
  @ApiPropertyOptional({ example: '1234 Elm Street' }) address?: string;
}

export class ZelleTransferDto {
  @ApiPropertyOptional({ example: 'Jane Doe' }) recipientName?: string;
  @ApiPropertyOptional({ example: 'zelle@example.com' }) email?: string;
  @ApiPropertyOptional({ example: '+1234567890' }) phone?: string;
}
