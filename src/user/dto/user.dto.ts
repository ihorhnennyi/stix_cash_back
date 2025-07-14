import { ApiProperty } from '@nestjs/swagger';
import { WireTransferDto, ZelleTransferDto } from './transfer-info.dto';

export class UserDto {
  @ApiProperty({ example: '64d7b2f3d234f0f4dcbf9999' })
  _id: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: '+1234567890' })
  phone: string;

  @ApiProperty({ example: 'USA' })
  country: string;

  @ApiProperty({ example: ['user', 'admin'] })
  roles: string[];

  @ApiProperty({
    example: ['https://drive.google.com/file/d/1x234abcd567/view'],
  })
  documents: string[];

  @ApiProperty({
    example: '1A2B3C4D5GoogleDriveFolderID',
    description: "User's folder ID in Google Drive",
  })
  googleDriveFolderId: string;

  @ApiProperty({
    example: 'bc1qexampleaddressbtc',
    description: 'BTC wallet address',
  })
  walletBTCAddress: string;

  @ApiProperty({
    example: 'paypal@example.com',
    description: 'PayPal email address',
  })
  paypalAddress: string;

  @ApiProperty({
    example: true,
    description: 'Whether to display balance in BTC',
  })
  showBTCBalance: boolean;

  @ApiProperty({
    example: 150.75,
    description: 'Balance in USD',
  })
  balance: number;

  @ApiProperty({
    example: 0.005,
    description: 'Balance in BTC',
  })
  balanceBTC: number;

  @ApiProperty({
    description: "User's transaction history",
    type: 'array',
    example: [
      {
        date: '2024-07-01T12:00:00Z',
        type: 'deposit',
        amount: 100,
        currency: 'USD',
        status: 'completed',
      },
    ],
  })
  transactions: {
    date: Date;
    type: 'deposit' | 'withdrawal';
    amount: number;
    currency: 'USD' | 'BTC';
    status: 'pending' | 'completed' | 'failed';
  }[];

  @ApiProperty({
    example: 'pending',
    enum: ['unverified', 'pending', 'verified'],
    description: 'User verification status',
  })
  verificationStatus: 'unverified' | 'pending' | 'verified';

  @ApiProperty({ type: () => WireTransferDto })
  wireTransfer: WireTransferDto;

  @ApiProperty({ type: () => ZelleTransferDto })
  zelleTransfer: ZelleTransferDto;
}
