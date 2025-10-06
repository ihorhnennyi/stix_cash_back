import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { plainToInstance } from "class-transformer";

import { JwtAuthGuard } from "../auth/guard/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/user.decorator";
import { JwtPayload } from "../common/types/jwt-payload.interface";

import { SanitizeDtoPipe } from "src/common/pipes/sanitize-user-update.pipe";
import { UpdateMeDto } from "./dto/update-me.dto";
import { UserDto } from "./dto/user.dto";
import { DocumentService } from "./services/document.service";
import { UserService } from "./services/user.service";

@ApiTags("User")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("user")
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly documentService: DocumentService
  ) {}

  @Get("profile")
  @ApiOperation({ summary: "Получить данные профиля пользователя" })
  @ApiResponse({
    status: 200,
    description: "Профиль пользователя получен",
    type: UserDto,
  })
  async getProfile(@CurrentUser() user: JwtPayload): Promise<UserDto> {
    const dbUser = await this.userService.getMe(user.sub);
    return plainToInstance(UserDto, dbUser.toObject(), {
      enableCircularCheck: true,
      excludeExtraneousValues: true,
    });
  }

  @Patch("me")
  @UsePipes(SanitizeDtoPipe)
  @ApiOperation({ summary: "Обновить данные о себе" })
  @ApiResponse({
    status: 200,
    description: "Данные успешно обновлены",
    type: UserDto,
  })
  async updateMe(
    @CurrentUser() user: JwtPayload,
    @Body() rawDto: UpdateMeDto
  ): Promise<UserDto> {
    const updatedUser = await this.userService.updateMe(user.sub, rawDto);
    return plainToInstance(UserDto, updatedUser.toObject(), {
      enableCircularCheck: true,
      excludeExtraneousValues: true,
    });
  }

  /* ---------------- Documents: upload/list/delete ---------------- */

  @Post("documents")
  @UseInterceptors(
    FilesInterceptor("files", 20, {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB на файл
        files: 20,
      },
    })
  )
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        files: {
          type: "array",
          items: { type: "string", format: "binary" },
          description: "Список файлов для загрузки",
        },
      },
      required: ["files"],
    },
  })
  @ApiOperation({
    summary: "Загрузить несколько документов в локальное хранилище",
  })
  @ApiResponse({
    status: 201,
    description: "Файлы успешно загружены в локальную папку пользователя",
    schema: {
      example: {
        message: "Файлы успешно загружены",
        files: [
          {
            name: "passport-2025-08-13T10-05-02-123Z.pdf",
            relPath: "66b123abc/passport-2025-08-13T10-05-02-123Z.pdf",
            mime: "application/pdf",
            size: 123456,
          },
          {
            name: "contract-2025-08-13T10-05-03-456Z.pdf",
            relPath: "66b123abc/contract-2025-08-13T10-05-03-456Z.pdf",
            mime: "application/pdf",
            size: 98765,
          },
        ],
      },
    },
  })
  @ApiBadRequestResponse({ description: "Файлы не были переданы" })
  async uploadMultipleDocuments(
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: JwtPayload
  ) {
    if (!files?.length) {
      throw new BadRequestException("Файлы не были переданы");
    }

    const results = await Promise.all(
      files.map((file) =>
        this.userService.uploadFile(
          {
            originalname: file.originalname,
            mimetype: file.mimetype,
            buffer: file.buffer,
          },
          user
        )
      )
    );

    return {
      message: "Файлы успешно загружены",
      files: results.map((r) => r.file),
    };
  }

  @Get("documents")
  @ApiOperation({ summary: "Список документов пользователя (с пагинацией)" })
  @ApiQuery({ name: "limit", required: false, example: 20 })
  @ApiQuery({ name: "offset", required: false, example: 0 })
  @ApiResponse({
    status: 200,
    description: "OK",
    schema: {
      example: {
        total: 2,
        items: [
          {
            _id: "66f0a3edc0a0e2b8c1f2d345",
            user: "66b123abc",
            name: "passport-....pdf",
            relPath: "66b123abc/passport-....pdf",
            mime: "application/pdf",
            size: 123456,
            createdAt: "2025-08-13T10:05:02.123Z",
            updatedAt: "2025-08-13T10:05:02.123Z",
          },
        ],
      },
    },
  })
  async listDocuments(
    @CurrentUser() user: JwtPayload,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string
  ) {
    const parsedLimit = Math.min(Math.max(Number(limit ?? 20), 0), 100);
    const parsedOffset = Math.max(Number(offset ?? 0), 0);

    const { items, total } = await this.documentService.findAllByUser(
      user.sub,
      { limit: parsedLimit, offset: parsedOffset }
    );

    return { total, items };
  }

  @Delete("documents/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Удалить документ пользователя по id" })
  @ApiParam({
    name: "id",
    description: "ID документа",
    example: "66f0a3edc0a0e2b8c1f2d345",
  })
  @ApiResponse({ status: 204, description: "Удалено" })
  @ApiResponse({ status: 404, description: "Документ не найден" })
  async deleteDocument(@Param("id") id: string) {
    await this.documentService.deleteById(id);
  }
}
