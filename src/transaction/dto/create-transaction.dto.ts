import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';

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
}
