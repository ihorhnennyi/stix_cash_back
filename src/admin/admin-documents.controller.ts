import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Auth } from '../common/decorators/auth.decorator';
import { Role } from '../types/role.enum';
import { DocumentService } from '../user/services/document.service';

@ApiTags('Admin - Documents')
@ApiBearerAuth()
@Auth(Role.Admin)
@Controller('admin/documents')
export class AdminDocumentsController {
  constructor(private readonly documentService: DocumentService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Получить документы конкретного пользователя' })
  @ApiParam({ name: 'userId', description: 'ID пользователя' })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'offset', required: false, example: 0 })
  @ApiResponse({ status: 200, description: 'OK' })
  async getUserDocuments(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const parsedLimit = Math.min(Math.max(Number(limit ?? 20), 0), 100);
    const parsedOffset = Math.max(Number(offset ?? 0), 0);
    const { items, total } = await this.documentService.findAllByUser(userId, {
      limit: parsedLimit,
      offset: parsedOffset,
    });
    return { total, items };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить документ (по ID)' })
  @ApiParam({ name: 'id', description: 'ID документа' })
  @ApiResponse({ status: 204, description: 'Документ удалён' })
  async deleteDocument(@Param('id') id: string) {
    await this.documentService.deleteById(id);
  }
}
