import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateTransactionStatusDto {
  @ApiProperty({
    example: 'completed',
    enum: ['pending', 'completed', 'failed', 'canceled'],
    description: 'Новый статус транзакции',
  })
  @IsEnum(['pending', 'completed', 'failed', 'canceled'], {
    message:
      'Статус должен быть одним из: pending, completed, failed, canceled',
  })
  status: 'pending' | 'completed' | 'failed' | 'canceled';
}
