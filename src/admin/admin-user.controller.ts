import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from '../common/decorators/auth.decorator';
import { Role } from '../types/role.enum';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { AdminUserService } from './admin-user.service';
import { FilterUserDto } from './dto/filter-user.dto';

@ApiTags('Admin - Users')
@Auth(Role.Admin)
@ApiBearerAuth()
@Controller('admin/users')
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}

  @Get()
  @ApiOperation({ summary: 'Получить всех пользователей (с фильтрами)' })
  getAll(@Query() filter: FilterUserDto) {
    return this.adminUserService.getAllUsers(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить одного пользователя по ID' })
  getById(@Param('id') id: string) {
    return this.adminUserService.getUserById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить пользователя' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.adminUserService.updateUser(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить пользователя' })
  delete(@Param('id') id: string) {
    return this.adminUserService.deleteUser(id);
  }
}
