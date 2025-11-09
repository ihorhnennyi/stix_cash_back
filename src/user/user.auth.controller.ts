import { Body, ConflictException, Controller, Post } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Model } from 'mongoose'

import { AuthService } from '../auth/auth.service'
import { JwtPayload } from '../common/types/jwt-payload.interface'
import { CreateUserDto } from './dto/create-user.dto'
import { LoginUserDto } from './dto/login-user.dto'
import { User, UserDocument } from './schema/user.schema'
import { UserService } from './services/user.service'

@ApiTags('User Auth')
@Controller('user/auth')
export class UserAuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно зарегистрирован',
    schema: {
      example: {
        message: 'Пользователь успешно зарегистрирован',
        accessToken: '...',
        refreshToken: '...'
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: 'Пользователь с таким email уже существует'
  })
  async register(@Body() dto: CreateUserDto) {
    const user = await this.userService.createUser(dto)
    if (!user) {
      throw new ConflictException('Не удалось создать пользователя')
    }

    const payload: JwtPayload = {
      sub: user._id.toHexString(),
      email: user.email,
      roles: user.roles
    }

    const tokens = await this.authService.generateTokens(payload)

    return {
      message: 'Пользователь успешно зарегистрирован',
      ...tokens
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Авторизация пользователя' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: 200,
    description: 'Успешная авторизация',
    schema: {
      example: {
        accessToken: '...',
        refreshToken: '...'
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Неверный логин или пароль'
  })
  async login(@Body() dto: LoginUserDto) {
    const user = await this.userService.validateUser(dto.email, dto.password)

    const payload: JwtPayload = {
      sub: user._id.toHexString(),
      email: user.email,
      roles: user.roles
    }

    return this.authService.generateTokens(payload)
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Обновление токенов доступа' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
      },
      required: ['refreshToken']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Токены успешно обновлены',
    schema: {
      example: {
        accessToken: '...',
        refreshToken: '...'
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Недействительный или просроченный refresh token'
  })
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshTokens(body.refreshToken)
  }

  /** ===== Новая конечная точка: повторная отправка письма для подтверждения email ===== */
  @Post('resend-email-verification')
  @ApiOperation({ summary: 'Повторная отправка письма подтверждения email' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { email: { type: 'string', example: 'user@example.com' } },
      required: ['email']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Письмо отправлено (если пользователь найден)'
  })
  async resendEmailVerification(@Body() body: { email: string }) {
    const user = await this.userModel.findOne({ email: body.email })
    if (!user) {
      return { ok: true, message: 'Если такой email существует, письмо отправлено' }
    }
    if (user.emailVerified) {
      return { ok: true, message: 'Email уже подтверждён' }
    }

    await this.userService.sendVerificationEmail(user)
    return { ok: true, message: 'Письмо отправлено' }
  }

  /** ===== Совместимость: старый роут (алиас), проксирует на новый ===== */
  @Post('resend-verification')
  @ApiOperation({ summary: '[DEPRECATED] Повторная отправка письма подтверждения email' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { email: { type: 'string', example: 'user@example.com' } },
      required: ['email']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Письмо отправлено (если пользователь найден)'
  })
  async resendVerificationAlias(@Body() body: { email: string }) {
    return this.resendEmailVerification(body)
  }
}
