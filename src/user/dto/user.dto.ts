import { ApiProperty } from '@nestjs/swagger';
import { WireTransferDto, ZelleTransferDto } from './transfer-info.dto';

export class UserDto {
  @ApiProperty() _id: string;
  @ApiProperty() firstName: string;
  @ApiProperty() lastName: string;
  @ApiProperty() email: string;
  @ApiProperty() phone: string;
  @ApiProperty() country: string;
  @ApiProperty() roles: string[];
  @ApiProperty() isVerified: boolean;
  @ApiProperty() documents: string[];
  @ApiProperty() googleDriveFolderId: string;
  @ApiProperty() walletBTCAddress: string;
  @ApiProperty() paypalAddress: string;
  @ApiProperty() showBTCBalance: boolean;
  @ApiProperty({ type: 'number', example: 100.5 }) balance: number;
  @ApiProperty({ type: 'number', example: 0.005 }) balanceBTC: number;

  @ApiProperty({
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

  @ApiProperty({ type: () => WireTransferDto })
  wireTransfer: WireTransferDto;

  @ApiProperty({ type: () => ZelleTransferDto })
  zelleTransfer: ZelleTransferDto;
}
