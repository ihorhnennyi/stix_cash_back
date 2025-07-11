import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsMongoId, IsOptional } from 'class-validator';

export class FilterTransactionsDto {
  @ApiPropertyOptional({ description: 'ID пользователя' })
  @IsMongoId()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ description: 'Дата от' })
  @IsDateString()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({ description: 'Дата до' })
  @IsDateString()
  @IsOptional()
  to?: string;

  @ApiPropertyOptional({
    description: 'Статус транзакции',
    enum: ['pending', 'completed', 'failed'],
  })
  @IsEnum(['pending', 'completed', 'failed'])
  @IsOptional()
  status?: 'pending' | 'completed' | 'failed';
}
