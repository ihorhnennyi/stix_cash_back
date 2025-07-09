import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBooleanString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class FilterUserDto {
  @ApiPropertyOptional({
    description: 'Поиск по email (регистронезависимый)',
    example: 'example@gmail.com',
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

  @ApiPropertyOptional({
    description: 'Минимальный баланс',
    example: 0,
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  balanceFrom?: number;

  @ApiPropertyOptional({
    description: 'Максимальный баланс',
    example: 1000,
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  balanceTo?: number;

  @ApiPropertyOptional({
    description: 'Дата создания: от',
    example: '2024-01-01',
  })
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  createdFrom?: Date;

  @ApiPropertyOptional({
    description: 'Дата создания: до',
    example: '2024-12-31',
  })
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  createdTo?: Date;

  @ApiPropertyOptional({
    description: 'Номер страницы',
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({
    description: 'Лимит записей на страницу',
    example: 20,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Поле сортировки',
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Направление сортировки',
    example: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
