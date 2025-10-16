import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MinLength } from 'class-validator'
export class PerformPasswordResetDto {
  @ApiProperty({ example: 'eyJhbGciOi...' }) @IsString() @IsNotEmpty() token: string
  @ApiProperty({ example: 'NewStrongPass123' }) @IsString() @MinLength(6) newPassword: string
}
