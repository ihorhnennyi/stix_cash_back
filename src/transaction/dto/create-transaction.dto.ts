import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({ example: 'deposit', enum: ['deposit', 'withdrawal'] })
  @IsEnum(['deposit', 'withdrawal'])
  type: 'deposit' | 'withdrawal';

  @ApiProperty({ example: 100.5 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'USD', enum: ['USD', 'BTC'] })
  @IsEnum(['USD', 'BTC'])
  currency: 'USD' | 'BTC';

  @ApiProperty({
    example: 'From Wallet',
    enum: ['From Wallet', 'To Wallet', 'Wire', 'PayPal', 'BTC'],
    required: false,
  })
  @IsOptional()
  @IsString()
  method?: string;

  @ApiProperty({ example: 'Комментарий к транзакции', required: false })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ example: '2024-07-11T10:00:00.000Z', required: false })
  @IsOptional()
  date?: Date;
}
