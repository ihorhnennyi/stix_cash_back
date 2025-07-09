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
import { Role } from '../types/role.enum';
import { CurrentUser } from './../common/decorators/user.decorator';
import { AdminService } from './admin.service';
import { LoginAdminDto } from './dto/login-admin.dto';

@ApiTags('Admin Auth')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(
    private readonly adminService: AdminService,
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  @ApiOperation({
    summary: 'Авторизация администратора',
    description: 'Вход администратора и получение access/refresh токенов',
  })
  @ApiBody({ type: LoginAdminDto })
  @ApiOkResponse({
    description: 'Успешный вход',
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
    summary: 'Обновление токенов',
    description: 'Получение новых access и refresh токенов',
  })
  @ApiBody({
    schema: {
      example: { refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
    },
  })
  @ApiOkResponse({
    description: 'Токены успешно обновлены',
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

  @Auth(Role.Admin)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Получение профиля администратора',
    description: 'Информация о текущем администраторе из токена',
  })
  @ApiOkResponse({
    description: 'Информация успешно получена',
    schema: {
      example: {
        sub: '665ff3d63bd098dd81fd9e65',
        email: 'admin@gmail.com',
        roles: ['admin'],
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав' })
  profile(@CurrentUser() user: JwtPayload) {
    return user;
  }
}
