import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { WireTransferDto, ZelleTransferDto } from './transfer-info.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    example: '1A2b3CbtcAddressHere',
    description: 'Bitcoin wallet address',
  })
  @IsOptional()
  @IsString()
  walletBTCAddress?: string;

  @ApiPropertyOptional({
    example: 'paypal@example.com',
    description: 'PayPal email address',
  })
  @IsOptional()
  @IsString()
  paypalAddress?: string;

  @ApiPropertyOptional({
    description: 'Wire transfer information',
    type: () => WireTransferDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => WireTransferDto)
  wireTransfer?: WireTransferDto;

  @ApiPropertyOptional({
    description: 'Zelle transfer information',
    type: () => ZelleTransferDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ZelleTransferDto)
  zelleTransfer?: ZelleTransferDto;

  @ApiPropertyOptional({
    example: true,
    description: 'Is the user verified?',
  })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Show balance in BTC?',
  })
  @IsOptional()
  @IsBoolean()
  showBTCBalance?: boolean;

  @ApiPropertyOptional({
    example: 1200.5,
    description: 'User balance in USD',
  })
  @IsOptional()
  @IsNumber()
  balance?: number;

  @ApiPropertyOptional({
    example: 0.015,
    description: 'User balance in BTC',
  })
  @IsOptional()
  @IsNumber()
  balanceBTC?: number;

  @ApiPropertyOptional({
    example: 'newAdminPassword123',
    description: 'New user password',
  })
  @IsOptional()
  @IsString()
  password?: string;
}
