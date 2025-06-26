import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from '../common/decorators/auth.decorator';
import { AdminUserService } from './admin-user.service';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Admin - Users')
@Auth('admin')
@ApiBearerAuth()
@Controller('admin/users')
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}

  @Get()
  @ApiOperation({ summary: 'Получить всех пользователей' })
  getAll() {
    return this.adminUserService.getAllUsers();
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
