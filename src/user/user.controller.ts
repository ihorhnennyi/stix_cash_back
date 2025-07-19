import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
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
  @UseInterceptors(FilesInterceptor('files')) // поле "files" вместо "file"
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiOperation({ summary: 'Загрузить несколько документов в Google Drive' })
  @ApiResponse({
    status: 201,
    description: 'Файлы успешно загружены',
    schema: {
      example: {
        message: 'Файлы успешно загружены',
        files: [
          {
            fileId: '1a2b3c4d5e',
            webViewLink: 'https://drive.google.com/file/d/1a2b3c4d5e/view',
            name: 'passport.pdf',
          },
          {
            fileId: '6f7g8h9i0j',
            webViewLink: 'https://drive.google.com/file/d/6f7g8h9i0j/view',
            name: 'contract.pdf',
          },
        ],
      },
    },
  })
  async uploadMultipleDocuments(
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: JwtPayload,
  ) {
    if (!files?.length) throw new BadRequestException('Файлы не были переданы');

    const results = await Promise.all(
      files.map((file) => {
        const normalizedFile = {
          originalname: file.originalname,
          mimetype: file.mimetype,
          buffer: file.buffer,
        };
        return this.userService.uploadFileToDrive(normalizedFile, user);
      }),
    );

    return {
      message: 'Файлы успешно загружены',
      files: results.map((r) => r.file),
    };
  }
}
