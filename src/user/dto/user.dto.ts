import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty() _id: string;
  @ApiProperty() firstName: string;
  @ApiProperty() lastName: string;
  @ApiProperty() email: string;
  @ApiProperty() phone: string;
  @ApiProperty() country: string;
  @ApiProperty() roles: string[];
  @ApiProperty() isVerified: boolean;
  @ApiProperty() documents: string[];
  @ApiProperty() googleDriveFolderId: string;
  @ApiProperty() walletBTCAddress: string;
  @ApiProperty() paypalAddress: string;
  @ApiProperty() showBTCBalance: boolean;
  @ApiProperty({ type: 'number' }) balance: number;
  @ApiProperty({ type: 'number' }) balanceBTC: number;
}
