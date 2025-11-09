import { Controller, Get, HttpCode, Query, Res } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { Model } from 'mongoose'
import { User, UserDocument } from '../user/schema/user.schema'
import { EmailVerificationService } from './email-verification.service'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly emailVerify: EmailVerificationService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly config: ConfigService
  ) {}

  @Get('verify-email')
  @HttpCode(200)
  @ApiOperation({ summary: 'Подтвердить email по одноразовому токену' })
  @ApiQuery({ name: 'token', required: true, description: 'JWT токен подтверждения email' })
  @ApiOkResponse({ description: 'Редирект на фронт с результатом подтверждения' })
  async verifyEmail(@Query('token') token: string, @Res() res: Response) {
    const front = this.config.get<string>('FRONT_URL') ?? '/'
    try {
      const payload = this.emailVerify.verify(token)
      const user = await this.userModel.findById(payload.sub)

      if (!user || user.email !== payload.email) {
        return res.redirect(`${front}/verify-email?status=not_found`)
      }

      if (!user.emailVerified) {
        user.emailVerified = true
        user.emailVerifiedAt = new Date()
        await user.save({ validateModifiedOnly: true })
      }

      return res.redirect(`${front}/verify-email?status=ok`)
    } catch (err) {
      console.error('[AuthController] verify-email error:', err)
      return res.redirect(`${front}/verify-email?status=invalid`)
    }
  }
}
