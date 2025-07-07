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

import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { JwtPayload } from '../common/types/jwt-payload.interface';

import { UpdateMeDto } from './dto/update-me.dto';
import { DocumentService } from './services/document.service';
import { UserService } from './user.service';

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
  @ApiResponse({ status: 200, description: 'Профиль пользователя получен' })
  async getProfile(@CurrentUser() user: JwtPayload) {
    return this.userService.findById(user.sub);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Обновить данные о себе' })
  @ApiResponse({ status: 200, description: 'Данные успешно обновлены' })
  async updateMe(@CurrentUser() user: JwtPayload, @Body() dto: UpdateMeDto) {
    return this.userService.updateMe(user.sub, dto);
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
  @ApiResponse({ status: 201, description: 'Файл успешно загружен' })
  async uploadPhoto(
    @UploadedFile()
    file: {
      originalname: string;
      mimetype: string;
      buffer: ArrayBuffer | Buffer | Buffer[];
    },
    @CurrentUser() user: JwtPayload,
  ) {
    if (!file) throw new BadRequestException('Файл не был передан');

    const normalizedFile = {
      ...file,
      buffer: Array.isArray(file.buffer) ? file.buffer[0] : file.buffer,
    };

    const { fileId, webViewLink } = await this.userService.uploadFileToDrive(
      normalizedFile,
      user,
    );

    return {
      message: 'Файл успешно загружен',
      fileId,
      webViewLink,
    };
  }

  @Get('documents')
  @ApiOperation({ summary: 'Получить список документов пользователя' })
  @ApiResponse({ status: 200, description: 'Документы получены' })
  async getDocuments(@CurrentUser() user: JwtPayload) {
    const dbUser = await this.userService.findById(user.sub);
    return dbUser.documents;
  }
}
