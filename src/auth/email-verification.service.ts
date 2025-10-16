import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as jwt from 'jsonwebtoken'

type EmailTokenPayload = {
  sub: string // userId
  email: string
  type: 'email-verify'
}

@Injectable()
export class EmailVerificationService {
  constructor(private readonly config: ConfigService) {}

  sign(userId: string, email: string) {
    const secret = this.config.get<string>('EMAIL_TOKEN_SECRET')!
    const expiresIn = this.config.get<string>('EMAIL_TOKEN_EXPIRES') ?? '24h'
    const payload: EmailTokenPayload = { sub: userId, email, type: 'email-verify' }
    return jwt.sign(payload, secret, { expiresIn })
  }

  verify(token: string): EmailTokenPayload {
    try {
      const secret = this.config.get<string>('EMAIL_TOKEN_SECRET')!
      const decoded = jwt.verify(token, secret) as EmailTokenPayload
      if (decoded?.type !== 'email-verify') throw new Error('Bad token type')
      return decoded
    } catch {
      throw new UnauthorizedException('Токен недействителен или истёк')
    }
  }
}
