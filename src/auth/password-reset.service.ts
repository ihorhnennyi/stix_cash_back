import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as jwt from 'jsonwebtoken'

type ResetTokenPayload = { sub: string; email: string; type: 'password-reset' }

@Injectable()
export class PasswordResetService {
  constructor(private readonly config: ConfigService) {}

  sign(userId: string, email: string) {
    const secret = this.config.get<string>('PASSWORD_RESET_TOKEN_SECRET')!
    const expiresIn = this.config.get<string>('PASSWORD_RESET_TOKEN_EXPIRES') ?? '15m'
    const payload: ResetTokenPayload = { sub: userId, email, type: 'password-reset' }
    return jwt.sign(payload, secret, { expiresIn })
  }

  verify(token: string): ResetTokenPayload {
    try {
      const secret = this.config.get<string>('PASSWORD_RESET_TOKEN_SECRET')!
      const decoded = jwt.verify(token, secret) as ResetTokenPayload
      if (decoded?.type !== 'password-reset') throw new Error('Bad token type')
      return decoded
    } catch {
      throw new UnauthorizedException('Токен недействителен или истёк')
    }
  }
}
