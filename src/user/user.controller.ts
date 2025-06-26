import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { Auth } from '../common/decorators/auth.decorator';
import { User } from '../common/decorators/user.decorator';
import { JwtPayload } from '../common/types/jwt-payload.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserService } from './user.service';

@ApiTags('User Auth')
@Controller('user/auth')
export class UserController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Регистрация пользователя',
    description: 'Регистрация нового пользователя в системе',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiOkResponse({
    description: 'Пользователь успешно зарегистрирован',
    schema: {
      example: {
        message: 'Пользователь успешно зарегистрирован',
      },
    },
  })
  async register(@Body() dto: CreateUserDto) {
    await this.userService.createUser(dto);
    return { message: 'Пользователь успешно зарегистрирован' };
  }

  @Post('login')
  @ApiOperation({
    summary: 'Авторизация пользователя',
    description: 'Вход пользователя и получение JWT токенов',
  })
  @ApiBody({ type: LoginUserDto })
  @ApiOkResponse({
    description: 'Успешный вход',
    schema: {
      example: {
        accessToken: '...',
        refreshToken: '...',
      },
    },
  })
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
  @ApiOperation({
    summary: 'Обновление JWT токенов',
    description: 'Обновление access и refresh токенов пользователя',
  })
  @ApiBody({
    schema: {
      example: {
        refreshToken: '...',
      },
    },
  })
  @ApiOkResponse({
    description: 'Новые токены',
    schema: {
      example: {
        accessToken: '...',
        refreshToken: '...',
      },
    },
  })
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshTokens(body.refreshToken);
  }

  @Get('profile')
  @Auth('user')
  @ApiOperation({
    summary: 'Профиль пользователя',
    description: 'Получение информации о текущем пользователе',
  })
  @ApiOkResponse({
    description: 'Профиль',
    schema: {
      example: {
        sub: '...',
        email: 'user@example.com',
        roles: ['user'],
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Неавторизован' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав' })
  profile(@User() user: JwtPayload) {
    return user;
  }
}
