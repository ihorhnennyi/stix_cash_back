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

  @ApiPropertyOptional({
    example: 100,
    description: 'Минимальный баланс пользователя',
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) => parseFloat(value))
  balanceFrom?: number;

  @ApiPropertyOptional({
    example: 1000,
    description: 'Максимальный баланс пользователя',
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) => parseFloat(value))
  balanceTo?: number;

  @ApiPropertyOptional({
    example: '2024-01-01',
    description: 'Дата регистрации: с',
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) => new Date(value))
  createdFrom?: Date;

  @ApiPropertyOptional({
    example: '2024-12-31',
    description: 'Дата регистрации: по',
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) => new Date(value))
  createdTo?: Date;

  @ApiPropertyOptional({
    example: '1',
    description: 'Страница (пагинация)',
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  page?: number;

  @ApiPropertyOptional({
    example: '20',
    description: 'Лимит на страницу (по умолчанию 20)',
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  limit?: number;

  @ApiPropertyOptional({
    example: 'createdAt',
    description: 'Поле для сортировки',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    example: 'desc',
    description: 'Направление сортировки (asc | desc)',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}
