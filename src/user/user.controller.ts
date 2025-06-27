import {
  BadRequestException,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Auth } from '../common/decorators/auth.decorator';
import { User as UserDecorator } from '../common/decorators/user.decorator';
import { JwtPayload } from '../common/types/jwt-payload.interface';
import { UserService } from './user.service';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @Auth('user')
  @ApiOperation({ summary: 'Профиль пользователя' })
  getProfile(@UserDecorator() user: JwtPayload) {
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
    @UserDecorator() user: JwtPayload,
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
