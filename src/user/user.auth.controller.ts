import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthService } from '../auth/auth.service';
import { JwtPayload } from '../common/types/jwt-payload.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserService } from './user.service';

@ApiTags('User Auth')
@Controller('user/auth')
export class UserAuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация пользователя' })
  @ApiBody({ type: CreateUserDto })
  async register(@Body() dto: CreateUserDto) {
    await this.userService.createUser(dto);
    return { message: 'Пользователь успешно зарегистрирован' };
  }

  @Post('login')
  @ApiOperation({ summary: 'Авторизация пользователя' })
  @ApiBody({ type: LoginUserDto })
  async login(@Body() dto: LoginUserDto) {
    const user = await this.userService.validateUser(dto.email, dto.password);
    const payload: JwtPayload = {
      sub: user._id.toHexString(),
      email: user.email,
      roles: user.roles,
    };
    return this.authService.generateTokens(payload);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Обновление токенов' })
  @ApiBody({ schema: { example: { refreshToken: '...' } } })
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshTokens(body.refreshToken);
  }
}
