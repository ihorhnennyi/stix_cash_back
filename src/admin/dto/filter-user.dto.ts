import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class FilterUserDto {
  @ApiPropertyOptional({
    description: 'Search by email (case-insensitive)',
    example: 'example@gmail.com',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'Filter by role',
    example: 'admin',
    enum: ['admin', 'user'],
  })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({
    description: 'Filter by verification status',
    example: 'pending',
    enum: ['unverified', 'pending', 'verified'],
  })
  @IsOptional()
  @IsEnum(['unverified', 'pending', 'verified'])
  verificationStatus?: 'unverified' | 'pending' | 'verified';

  @ApiPropertyOptional({
    description: 'Minimum balance',
    example: 0,
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  balanceFrom?: number;

  @ApiPropertyOptional({
    description: 'Maximum balance',
    example: 1000,
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  balanceTo?: number;

  @ApiPropertyOptional({
    description: 'Created date from',
    example: '2024-01-01',
  })
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  createdFrom?: Date;

  @ApiPropertyOptional({
    description: 'Created date to',
    example: '2024-12-31',
  })
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  createdTo?: Date;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort direction',
    example: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
