import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateTransactionDto {
  @ApiPropertyOptional({ enum: ['deposit', 'withdrawal'] })
  @IsEnum(['deposit', 'withdrawal'])
  @IsOptional()
  type?: 'deposit' | 'withdrawal';

  @ApiPropertyOptional({ example: '150.00' })
  @IsNumberString()
  @IsOptional()
  amount?: string;

  @ApiPropertyOptional({ example: '1250.00' })
  @IsNumberString()
  @IsOptional()
  balance?: string;

  @ApiPropertyOptional({ enum: ['USD', 'BTC'] })
  @IsEnum(['USD', 'BTC'])
  @IsOptional()
  currency?: 'USD' | 'BTC';

  @ApiPropertyOptional({
    enum: [
      'walletBTCAddress',
      'wireTransfer',
      'zelleTransfer',
      'paypalAddress',
    ],
  })
  @IsEnum([
    'walletBTCAddress',
    'wireTransfer',
    'zelleTransfer',
    'paypalAddress',
  ])
  @IsOptional()
  method?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  note?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  transactionId?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  date?: Date;

  @ApiPropertyOptional({ enum: ['pending', 'completed', 'failed', 'canceled'] })
  @IsEnum(['pending', 'completed', 'failed', 'canceled'])
  @IsOptional()
  status?: 'pending' | 'completed' | 'failed' | 'canceled';
}
