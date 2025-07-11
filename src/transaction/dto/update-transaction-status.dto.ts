import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateTransactionStatusDto {
  @ApiProperty({
    example: 'completed',
    enum: ['pending', 'completed', 'failed'],
  })
  @IsEnum(['pending', 'completed', 'failed'])
  status: 'pending' | 'completed' | 'failed';
}
