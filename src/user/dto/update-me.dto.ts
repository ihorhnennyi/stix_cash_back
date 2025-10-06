import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { WireTransferDto, ZelleTransferDto } from "./transfer-info.dto";

export class UpdateMeDto {
  @ApiPropertyOptional({ example: "John", description: "First name" })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: "Doe", description: "Last name" })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: "+1234567890", description: "Phone number" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: "USA", description: "Country" })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    example: "john@example.com",
    description: "Email address",
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: true, description: "Agreed to terms" })
  @IsOptional()
  @IsBoolean()
  isTermsAccepted?: boolean;

  @ApiPropertyOptional({
    example: "paypal@example.com",
    description: "PayPal address",
  })
  @IsOptional()
  @IsString()
  paypalAddress?: string;

  @ApiPropertyOptional({
    example: "1A2b3CbtcAddressHere",
    description: "BTC wallet address",
  })
  @IsOptional()
  @IsString()
  walletBTCAddress?: string;

  @ApiPropertyOptional({
    type: () => WireTransferDto,
    description: "Wire transfer information",
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => WireTransferDto)
  wireTransfer?: WireTransferDto;

  @ApiPropertyOptional({
    type: () => ZelleTransferDto,
    description: "Zelle transfer information",
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ZelleTransferDto)
  zelleTransfer?: ZelleTransferDto;

  @ApiPropertyOptional({
    example: "newStrongPass123",
    description: "New password",
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({
    example: "100.50",
    description: "User balance in USD",
  })
  @IsOptional()
  @IsString()
  balance?: string;

  @ApiPropertyOptional({
    example: "0.0032",
    description: "User balance in BTC",
  })
  @IsOptional()
  @IsString()
  balanceBTC?: string;

  @ApiPropertyOptional({
    example: "123 Main St, Apt 4B, New York, NY",
    description: "Merchant address",
  })
  @IsOptional()
  @IsString()
  merchantAddress?: string;
}
