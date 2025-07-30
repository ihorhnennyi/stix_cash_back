import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../user/dto/user.dto';

export class TransactionDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  type: 'deposit' | 'withdrawal';

  @ApiProperty()
  amount: string;

  @ApiProperty()
  balance: string;

  @ApiProperty()
  currency: 'USD' | 'BTC';

  @ApiProperty()
  status: 'pending' | 'completed' | 'failed' | 'canceled';

  @ApiProperty()
  createdByAdmin: boolean;

  @ApiProperty({ required: false })
  method?:
    | 'walletBTCAddress'
    | 'wireTransfer'
    | 'zelleTransfer'
    | 'paypalAddress';

  @ApiProperty({ required: false })
  note?: string;

  @ApiProperty({ required: false })
  date?: Date;

  @ApiProperty({ required: false })
  transactionId?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: () => UserDto })
  user: UserDto;
}
