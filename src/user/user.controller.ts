import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';

import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { JwtPayload } from '../common/types/jwt-payload.interface';

import { SanitizeDtoPipe } from 'src/common/pipes/sanitize-user-update.pipe';
import { UpdateMeDto } from './dto/update-me.dto';
import { UserDto } from './dto/user.dto';
import { DocumentService } from './services/document.service';
import { UserService } from './services/user.service';

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly documentService: DocumentService,
  ) {}

  @Get('profile')
  @ApiOperation({ summary: 'Получить данные профиля пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Профиль пользователя получен',
    type: UserDto,
  })
  async getProfile(@CurrentUser() user: JwtPayload): Promise<UserDto> {
    const dbUser = await this.userService.getMe(user.sub);
    return plainToInstance(UserDto, dbUser.toObject(), {
      enableCircularCheck: true,
      excludeExtraneousValues: true,
    });
  }

  @Patch('me')
  @UsePipes(SanitizeDtoPipe)
  @ApiOperation({ summary: 'Обновить данные о себе' })
  @ApiResponse({
    status: 200,
    description: 'Данные успешно обновлены',
    type: UserDto,
  })
  async updateMe(
    @CurrentUser() user: JwtPayload,
    @Body() rawDto: UpdateMeDto,
  ): Promise<UserDto> {
    const updatedUser = await this.userService.updateMe(user.sub, rawDto);
    return plainToInstance(UserDto, updatedUser.toObject(), {
      enableCircularCheck: true,
      excludeExtraneousValues: true,
    });
  }

  @Post('documents')
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
  @ApiOperation({ summary: 'Загрузить документ в Google Drive' })
  @ApiResponse({
    status: 201,
    description: 'Файл успешно загружен',
    schema: {
      example: {
        message: 'Файл успешно загружен',
        fileId: '1a2b3c4d5e',
        webViewLink: 'https://drive.google.com/file/d/1a2b3c4d5e/view',
      },
    },
  })
  async uploadPhoto(
    @UploadedFile()
    file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!file || !file.buffer)
      throw new BadRequestException('Файл не был передан');

    const normalizedFile = {
      originalname: file.originalname,
      mimetype: file.mimetype,
      buffer:
        file.buffer instanceof Buffer
          ? file.buffer
          : Buffer.from(file.buffer as unknown as ArrayBuffer),
    };

    const result = await this.userService.uploadFileToDrive(
      normalizedFile,
      user,
    );

    return result;
  }
}
