import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { WireTransferDto, ZelleTransferDto } from './transfer-info.dto';

@Exclude()
export class UserDto {
  @Expose()
  @ApiProperty({ example: '64d7b2f3d234f0f4dcbf9999' })
  _id: string;

  @Expose()
  @ApiProperty({ example: 'John' })
  firstName: string;

  @Expose()
  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @Expose()
  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @Expose()
  @ApiProperty({ example: '+1234567890' })
  phone: string;

  @Expose()
  @ApiProperty({ example: 'USA' })
  country: string;

  @Expose()
  @ApiProperty({ example: ['user', 'admin'] })
  roles: string[];

  // Опционально, т.к. нет в схеме User
  @Expose()
  @ApiPropertyOptional({
    example: '1A2B3C4D5GoogleDriveFolderID',
    description: "User's folder ID in Google Drive",
  })
  googleDriveFolderId?: string;

  @Expose()
  @ApiProperty({
    example: 'bc1qexampleaddressbtc',
    description: 'BTC wallet address',
  })
  walletBTCAddress: string;

  @Expose()
  @ApiProperty({
    example: 'paypal@example.com',
    description: 'PayPal email address',
  })
  paypalAddress: string;

  @Expose()
  @ApiProperty({
    example: true,
    description: 'Whether to display balance in BTC',
  })
  showBTCBalance: boolean;

  @Expose()
  @Transform(({ value }) => value?.toString?.() ?? value)
  @ApiProperty({
    example: '150.75',
    description: 'Balance in USD',
    type: String,
  })
  balance: string;

  @Expose()
  @Transform(({ value }) => value?.toString?.() ?? value)
  @ApiProperty({
    example: '0.005',
    description: 'Balance in BTC',
    type: String,
  })
  balanceBTC: string;

  @Expose()
  @ApiProperty({
    example: true,
    description: 'Разрешены ли транзакции для пользователя',
  })
  isTransactionAllowed: boolean;

  @Expose()
  @ApiProperty({
    example: 'pending',
    enum: ['unverified', 'pending', 'verified'],
    description: 'User verification status',
  })
  verificationStatus: 'unverified' | 'pending' | 'verified';

  @Expose()
  @ApiProperty({ type: () => WireTransferDto })
  wireTransfer: WireTransferDto;

  @Expose()
  @ApiProperty({ type: () => ZelleTransferDto })
  zelleTransfer: ZelleTransferDto;

  // Новое поле
  @Expose()
  @ApiPropertyOptional({
    example: '123 Main St, Apt 4B, New York, NY',
    description: 'Merchant address',
  })
  merchantAddress?: string;
}
