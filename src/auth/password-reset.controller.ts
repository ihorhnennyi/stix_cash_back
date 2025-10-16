import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import * as bcrypt from 'bcryptjs'
import { Model } from 'mongoose'

import { MailService } from '../mail/mail.service'
import { passwordResetHtml, passwordResetText } from '../mail/templates/password-reset'
import { User, UserDocument } from '../user/schema/user.schema'
import { PerformPasswordResetDto } from './dto/perform-password-reset.dto'
import { RequestPasswordResetDto } from './dto/request-password-reset.dto'
import { PasswordResetService } from './password-reset.service'

@ApiTags('Auth')
@Controller('auth')
export class PasswordResetController {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly resetTokens: PasswordResetService,
    private readonly config: ConfigService,
    private readonly mail: MailService
  ) {}

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Запрос на сброс пароля' })
  @ApiBody({ type: RequestPasswordResetDto })
  @ApiResponse({ status: 200, description: 'Если email существует — письмо отправлено' })
  async request(@Body() dto: RequestPasswordResetDto) {
    const user = await this.userModel.findOne({ email: dto.email })
    if (user) {
      const token = this.resetTokens.sign(user._id.toString(), user.email)
      const frontUrl =
        this.config.get<string>('FRONT_URL') ?? this.config.get<string>('APP_URL') ?? ''
      const appName = this.config.get<string>('APP_NAME') ?? 'Our App'
      const appUrl = this.config.get<string>('APP_URL') ?? frontUrl
      const actionUrl = `${frontUrl}/reset-password?token=${encodeURIComponent(token)}`

      await this.mail.sendMail({
        to: user.email,
        subject: `${appName}: Сброс пароля`,
        html: passwordResetHtml({ appName, appUrl, userName: user.firstName || 'User', actionUrl }),
        text: passwordResetText({ appName, userName: user.firstName || 'User', actionUrl })
      })
    }
    return { ok: true, message: 'Если такой email существует — мы отправили письмо со ссылкой' }
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Установить новый пароль по токену' })
  @ApiBody({ type: PerformPasswordResetDto })
  @ApiResponse({ status: 200, description: 'Пароль успешно изменён' })
  async perform(@Body() dto: PerformPasswordResetDto) {
    const payload = this.resetTokens.verify(dto.token)
    const user = await this.userModel.findById(payload.sub)
    if (!user || user.email !== payload.email) {
      // маскируем детали
      return { ok: true }
    }
    user.password = await bcrypt.hash(dto.newPassword, 10)
    await user.save({ validateModifiedOnly: true })
    return { ok: true, message: 'Пароль успешно изменён' }
  }
}
