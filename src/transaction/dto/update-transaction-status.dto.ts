import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateTransactionStatusDto {
  @ApiProperty({
    example: 'completed',
    enum: ['pending', 'completed', 'failed'],
    description: 'Новый статус транзакции',
  })
  @IsEnum(['pending', 'completed', 'failed'], {
    message: 'Статус должен быть одним из: pending, completed, failed',
  })
  status: 'pending' | 'completed' | 'failed';
}
