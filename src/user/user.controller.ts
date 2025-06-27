import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

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

  @Get('profile')
  @Auth('user')
  @ApiOperation({ summary: 'Профиль пользователя' })
  profile(@User() user: JwtPayload) {
    return user;
  }

  @Post('upload-photo')
  @Auth('user')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadPhoto(
    @UploadedFile()
    file: {
      originalname: string;
      mimetype: string;
      buffer: ArrayBuffer | Buffer | Buffer[];
    },
    @User() user: JwtPayload,
  ) {
    if (!file) throw new BadRequestException('Файл не был передан');

    const normalizedFile = {
      ...file,
      buffer: Array.isArray(file.buffer) ? file.buffer[0] : file.buffer,
    };

    const { fileId } = await this.userService.uploadFileToDrive(
      normalizedFile,
      user,
    );

    return { message: 'Файл успешно загружен', fileId };
  }
}
