import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../common/types/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async generateTokens(payload: JwtPayload) {
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

  async refreshTokens(refreshToken: string) {
    try {
      const payload =
        await this.jwtService.verifyAsync<JwtPayload>(refreshToken);

      const newPayload: JwtPayload = {
        sub: payload.sub,
        email: payload.email,
        roles: payload.roles,
      };

      const accessToken = await this.jwtService.signAsync(newPayload, {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
      });

      const newRefreshToken = await this.jwtService.signAsync(newPayload, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch {
      throw new Error('Недействительный refresh токен');
    }
  }
}
