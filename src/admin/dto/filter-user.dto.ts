import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBooleanString, IsOptional, IsString } from 'class-validator';

export class FilterUserDto {
  @ApiPropertyOptional({
    description: 'Поиск по email (регистронезависимый)',
    example: 'gmail.com',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'Фильтрация по роли',
    example: 'admin',
    enum: ['admin', 'user'],
  })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({
    description: 'Фильтрация по статусу верификации',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBooleanString()
  @Transform(({ value }) => value === 'true')
  isVerified?: boolean;
}
