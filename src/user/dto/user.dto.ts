import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Exclude, Expose, Transform } from 'class-transformer'
import { WireTransferDto, ZelleTransferDto } from './transfer-info.dto'

@Exclude()
export class UserDto {
  @Expose()
  @ApiProperty({ example: '64d7b2f3d234f0f4dcbf9999' })
  _id: string

  @Expose()
  @ApiProperty({ example: 'John' })
  firstName: string

  @Expose()
  @ApiProperty({ example: 'Doe' })
  lastName: string

  @Expose()
  @ApiProperty({ example: 'john@example.com' })
  email: string

  @Expose()
  @ApiProperty({ example: '+1234567890' })
  phone: string

  @Expose()
  @ApiProperty({ example: 'USA' })
  country: string

  @Expose()
  @ApiProperty({ example: ['user', 'admin'] })
  roles: string[]

  /** ===== EMAIL CONFIRMATION ===== */
  @Expose()
  @ApiProperty({
    example: true,
    description: 'Подтверждён ли email пользователя'
  })
  emailVerified: boolean

  @Expose()
  @ApiPropertyOptional({
    example: '2025-11-09T12:00:00.000Z',
    description: 'Дата подтверждения email (если подтверждён)',
    nullable: true
  })
  emailVerifiedAt: string | null

  /** ===== KYC / ДОКУМЕНТЫ ===== */
  @Expose()
  @ApiProperty({
    example: 'pending',
    enum: ['unverified', 'pending', 'verified'],
    description: 'Статус верификации документов (KYC)'
  })
  kycStatus: 'unverified' | 'pending' | 'verified'

  /** ===== ФИНАНСЫ ===== */
  @Expose()
  @Transform(({ value }) => value?.toString?.() ?? value)
  @ApiProperty({
    example: '150.75',
    description: 'Баланс в USD',
    type: String
  })
  balance: string

  @Expose()
  @Transform(({ value }) => value?.toString?.() ?? value)
  @ApiProperty({
    example: '0.005',
    description: 'Баланс в BTC',
    type: String
  })
  balanceBTC: string

  @Expose()
  @ApiProperty({
    example: true,
    description: 'Показывать ли баланс в BTC'
  })
  showBTCBalance: boolean

  @Expose()
  @ApiProperty({
    example: true,
    description: 'Разрешены ли транзакции для пользователя'
  })
  isTransactionAllowed: boolean

  /** ===== РЕКВИЗИТЫ ===== */
  @Expose()
  @ApiProperty({
    example: 'bc1qexampleaddressbtc',
    description: 'BTC-кошелёк пользователя'
  })
  walletBTCAddress: string

  @Expose()
  @ApiProperty({
    example: 'paypal@example.com',
    description: 'PayPal адрес пользователя'
  })
  paypalAddress: string

  @Expose()
  @ApiProperty({ type: () => WireTransferDto })
  wireTransfer: WireTransferDto

  @Expose()
  @ApiProperty({ type: () => ZelleTransferDto })
  zelleTransfer: ZelleTransferDto

  /** ===== ПРОЧЕЕ ===== */
  @Expose()
  @ApiPropertyOptional({
    example: '1A2B3C4D5GoogleDriveFolderID',
    description: 'ID папки пользователя в Google Drive'
  })
  googleDriveFolderId?: string

  @Expose()
  @ApiPropertyOptional({
    example: '123 Main St, Apt 4B, New York, NY',
    description: 'Адрес мерчанта (для выплат и реквизитов)'
  })
  merchantAddress?: string
}
