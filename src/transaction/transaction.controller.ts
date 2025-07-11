import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

import { JwtPayload } from '../common/types/jwt-payload.interface';
import { Role } from '../types/role.enum';

import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';
import { TransactionService } from './transaction.service';

@ApiTags('Транзакции')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @ApiOperation({ summary: 'Запросить ввод/вывод денег (пользователь)' })
  @ApiResponse({ status: 201, description: 'Транзакция создана' })
  @ApiResponse({ status: 401, description: 'Неавторизован' })
  @Post()
  async createUserTransaction(
    @Body() dto: CreateTransactionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.transactionService.create(user.sub, dto, false);
  }

  @ApiOperation({ summary: 'Создать транзакцию для пользователя (админ)' })
  @ApiResponse({ status: 201, description: 'Транзакция создана админом' })
  @ApiResponse({ status: 403, description: 'Нет прав доступа' })
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @Post('admin/:userId')
  async createAdminTransaction(
    @Param('userId') userId: string,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactionService.create(userId, dto, true);
  }

  @ApiOperation({ summary: 'Обновить статус транзакции (админ)' })
  @ApiResponse({ status: 200, description: 'Статус обновлён' })
  @ApiResponse({ status: 404, description: 'Транзакция не найдена' })
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTransactionStatusDto,
  ) {
    return this.transactionService.updateStatus(id, dto);
  }

  @ApiOperation({ summary: 'Получить все транзакции (админ)' })
  @ApiResponse({ status: 200, description: 'Список всех транзакций' })
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @Get()
  async getAllTransactions(
    @Query('userId') userId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.transactionService.findAllWithFilters(userId, from, to);
  }

  @ApiOperation({ summary: 'Получить свои транзакции (пользователь)' })
  @ApiResponse({ status: 200, description: 'Список моих транзакций' })
  @Get('my')
  async getMyTransactions(@CurrentUser() user: JwtPayload) {
    return this.transactionService.findByUser(user.sub);
  }

  @ApiOperation({ summary: 'Получить транзакцию по ID (админ)' })
  @ApiResponse({ status: 200, description: 'Одна транзакция' })
  @ApiResponse({ status: 404, description: 'Транзакция не найдена' })
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @Get(':id')
  async getTransactionById(@Param('id') id: string) {
    return this.transactionService.findById(id);
  }
}
