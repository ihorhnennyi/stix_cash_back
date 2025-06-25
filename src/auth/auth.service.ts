import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminDocument } from '../admin/schema/admin.schema';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async generateTokens(admin: AdminDocument) {
    const payload = {
      sub: admin._id,
      email: admin.email,
      roles: admin.roles,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
