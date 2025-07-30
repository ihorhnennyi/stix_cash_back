import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { TransactionType } from '../../types/transaction-type.enum';

export class CreateTransactionDto {
  @ApiProperty({ example: 'deposit', enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({ example: '100.5' })
  @Transform(({ value }) => value.toString())
  @IsString()
  amount: string;

  @ApiProperty({ example: '1200.75', description: 'Баланс после транзакции' })
  @Transform(({ value }) => value.toString())
  @IsString()
  balance: string;

  @ApiProperty({ example: 'USD', enum: ['USD', 'BTC'] })
  @IsEnum(['USD', 'BTC'])
  currency: 'USD' | 'BTC';

  @ApiProperty({
    example: 'walletBTCAddress',
    enum: [
      'walletBTCAddress',
      'wireTransfer',
      'zelleTransfer',
      'paypalAddress',
    ],
    required: false,
  })
  @IsOptional()
  @IsEnum([
    'walletBTCAddress',
    'wireTransfer',
    'zelleTransfer',
    'paypalAddress',
  ])
  method?:
    | 'walletBTCAddress'
    | 'wireTransfer'
    | 'zelleTransfer'
    | 'paypalAddress';

  @ApiProperty({ example: 'Комментарий к транзакции', required: false })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ example: '2024-07-11T10:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  date?: Date;

  @ApiProperty({
    example: 'completed',
    enum: ['pending', 'completed', 'failed', 'canceled'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['pending', 'completed', 'failed', 'canceled'])
  status?: 'pending' | 'completed' | 'failed' | 'canceled';

  @ApiProperty({ example: 'abc123xyz789', required: false })
  @IsOptional()
  @IsString()
  transactionId?: string;
}
