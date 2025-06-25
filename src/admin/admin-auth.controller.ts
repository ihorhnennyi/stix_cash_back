import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
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
    return this.authService.generateTokens(admin);
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
}
