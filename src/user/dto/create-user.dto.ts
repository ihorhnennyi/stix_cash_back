import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from "class-validator";

export class CreateUserDto {
  @ApiProperty({ example: "Ivan", description: "User first name" })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: "Ivanov", description: "User last name" })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    example: "ivan@example.com",
    description: "User email address",
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: "+380931234567",
    description: "User phone number in international format (+380...)",
    pattern: "^\\+\\d{10,15}$",
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+\d{10,15}$/, {
    message: "Phone number must be in international format, e.g. +380931234567",
  })
  phone: string;

  @ApiProperty({ example: "Ukraine", description: "User country" })
  @IsNotEmpty()
  @IsString()
  country: string;

  @ApiProperty({ example: "superSecure123", description: "User password" })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    example: true,
    description: "User has accepted the terms and conditions",
    required: true,
  })
  @IsBoolean()
  isTermsAccepted: boolean;

  @ApiPropertyOptional({
    example: "123 Main St, Apt 4B, Kyiv, Ukraine",
    description: "Merchant address (optional at registration)",
  })
  @IsOptional()
  @IsString()
  merchantAddress?: string;
}
