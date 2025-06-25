import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { AdminService } from './admin.service';
import { LoginAdminDto } from './dto/login-admin.dto';

import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@ApiTags('Admin Auth')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(
    private adminService: AdminService,
    private authService: AuthService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Авторизация Root Admin' })
  @ApiBody({ type: LoginAdminDto })
  @ApiOkResponse({
    description: 'Успешный логин, JWT токены',
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
}
