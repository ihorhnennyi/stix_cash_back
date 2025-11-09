import { ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsIn, IsOptional, IsString, ValidateNested } from 'class-validator'
import { CreateUserDto } from './create-user.dto'
import { WireTransferDto, ZelleTransferDto } from './transfer-info.dto'

const KYC_STATUSES = ['unverified', 'pending', 'verified'] as const
type KycStatus = (typeof KYC_STATUSES)[number]

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    example: '1A2b3CbtcAddressHere',
    description: 'Bitcoin wallet address'
  })
  @IsOptional()
  @IsString()
  walletBTCAddress?: string

  @ApiPropertyOptional({
    example: 'paypal@example.com',
    description: 'PayPal email address'
  })
  @IsOptional()
  @IsString()
  paypalAddress?: string

  @ApiPropertyOptional({
    description: 'Wire transfer information',
    type: () => WireTransferDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => WireTransferDto)
  wireTransfer?: WireTransferDto

  @ApiPropertyOptional({
    description: 'Zelle transfer information',
    type: () => ZelleTransferDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ZelleTransferDto)
  zelleTransfer?: ZelleTransferDto

  @ApiPropertyOptional({
    example: false,
    description: 'Show balance in BTC?'
  })
  @IsOptional()
  @IsBoolean()
  showBTCBalance?: boolean

  @IsOptional()
  @IsString()
  balance?: string

  @IsOptional()
  @IsString()
  balanceBTC?: string

  @ApiPropertyOptional({
    example: 'newAdminPassword123',
    description: 'New user password'
  })
  @IsOptional()
  @IsString()
  password?: string

  @ApiPropertyOptional({
    example: true,
    description: 'Разрешить пользователю выполнять транзакции'
  })
  @IsOptional()
  @IsBoolean()
  isTransactionAllowed?: boolean

  @ApiPropertyOptional({
    example: 'pending',
    enum: KYC_STATUSES,
    description: 'KYC status (документы): unverified | pending | verified'
  })
  @IsOptional()
  @IsIn(KYC_STATUSES)
  kycStatus?: KycStatus

  @ApiPropertyOptional({
    example: '123 Main St, Apt 4B, New York, NY',
    description: 'Merchant address'
  })
  @IsOptional()
  @IsString()
  merchantAddress?: string
}
