import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { Auth } from '../common/decorators/auth.decorator';
import { JwtPayload } from '../common/types/jwt-payload.interface';
import { CurrentUser } from './../common/decorators/user.decorator';
import { AdminService } from './admin.service';
import { LoginAdminDto } from './dto/login-admin.dto';

@ApiTags('Admin Auth')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(
    private adminService: AdminService,
    private authService: AuthService,
  ) {}

  @Post('login')
  @ApiOperation({
    summary: 'Авторизация администратора',
    description:
      'Позволяет выполнить вход администратора в систему Stix Cash и получить JWT access и refresh токены.',
  })
  @ApiBody({ type: LoginAdminDto })
  @ApiOkResponse({
    description: 'Успешный логин',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  async login(@Body() dto: LoginAdminDto) {
    const admin = await this.adminService.validateAdmin(
      dto.email,
      dto.password,
    );

    const payload: JwtPayload = {
      sub: admin._id.toString(),
      email: admin.email,
      roles: admin.roles,
    };

    return this.authService.generateTokens(payload);
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Обновление JWT токенов',
    description:
      'Позволяет обновить JWT access и refresh токены администратора.',
  })
  @ApiBody({
    schema: {
      example: {
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiOkResponse({
    description: 'Успешное обновление токенов',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshTokens(body.refreshToken);
  }

  @Get('profile')
  @Auth('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Профиль администратора',
    description: 'Получение данных текущего администратора по access токену.',
  })
  @ApiOkResponse({
    description: 'Информация о текущем администраторе',
    schema: {
      example: {
        sub: '665ff3d63bd098dd81fd9e65',
        email: 'admin@gmail.com',
        roles: ['admin'],
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Неавторизован' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав' })
  profile(@CurrentUser() user: JwtPayload) {
    return user;
  }
}
