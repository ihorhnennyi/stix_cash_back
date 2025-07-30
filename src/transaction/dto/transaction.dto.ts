import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UserDto } from '../../user/dto/user.dto';

export class TransactionDto {
  @Expose()
  @ApiProperty()
  _id: string;

  @Expose()
  @ApiProperty()
  type: 'deposit' | 'withdrawal';

  @Expose()
  @ApiProperty()
  amount: string;

  @Expose()
  @ApiProperty()
  balance: string;

  @Expose()
  @ApiProperty()
  currency: 'USD' | 'BTC';

  @Expose()
  @ApiProperty()
  status: 'pending' | 'completed' | 'failed' | 'canceled';

  @Expose()
  @ApiProperty()
  createdByAdmin: boolean;

  @Expose()
  @ApiProperty({ required: false })
  method?: string;

  @Expose()
  @ApiProperty({ required: false })
  note?: string;

  @Expose()
  @ApiProperty({ required: false })
  date?: Date;

  @Expose()
  @ApiProperty({ required: false })
  transactionId?: string;

  @Expose()
  @ApiProperty({ required: false, description: 'Дополнительные реквизиты' })
  paymentDetails?: Record<string, any>;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;

  @Expose()
  @ApiProperty({ type: () => UserDto })
  @Type(() => UserDto)
  user: UserDto;
}
