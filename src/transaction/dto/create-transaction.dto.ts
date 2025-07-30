// src/transactions/dto/create-transaction.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { TransactionType } from '../../types/transaction-type.enum';

export class CreateTransactionDto {
  @ApiProperty({ example: 'deposit', enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({ example: '100.5' })
  @IsString()
  amount: string;

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
  method?: string;

  @ApiProperty({ example: 'Комментарий', required: false })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ example: '2025-07-30T10:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  date?: Date;

  @ApiProperty({
    example: 'pending',
    enum: ['pending', 'completed', 'failed', 'canceled'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['pending', 'completed', 'failed', 'canceled'])
  status?: 'pending' | 'completed' | 'failed' | 'canceled';

  @ApiProperty({ example: 'abc123', required: false })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiProperty({ example: 'user@paypal.com', required: false })
  @IsOptional()
  @IsString()
  paypalEmail?: string;

  @ApiProperty({ example: 'user@zelle.com', required: false })
  @IsOptional()
  @IsString()
  zelleEmail?: string;

  @ApiProperty({
    example: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    required: false,
  })
  @IsOptional()
  @IsString()
  walletBTCAddress?: string;

  @ApiProperty({ example: '1234567890', required: false })
  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @ApiProperty({ example: 'Bank of America', required: false })
  @IsOptional()
  @IsString()
  bankName?: string;
}
