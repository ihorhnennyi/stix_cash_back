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
import { FilterTransactionsDto } from './dto/filter-transactions.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionService } from './transaction.service';

@ApiTags('Транзакции')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @ApiOperation({ summary: 'Создать транзакцию (пользователь)' })
  @ApiResponse({ status: 201, description: 'Транзакция создана' })
  @Post()
  async createUserTransaction(
    @Body() dto: CreateTransactionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.transactionService.create(user.sub, dto, false);
  }

  @ApiOperation({ summary: 'Создать транзакцию (админ)' })
  @ApiResponse({ status: 201, description: 'Транзакция создана админом' })
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @Post('admin/:userId')
  async createAdminTransaction(
    @Param('userId') userId: string,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactionService.create(userId, dto, true);
  }

  @Patch(':id')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Редактировать транзакцию (админ)' })
  @ApiResponse({ status: 200, description: 'Транзакция обновлена' })
  @ApiResponse({ status: 404, description: 'Транзакция не найдена' })
  async updateTransaction(
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionService.updateByAdmin(id, dto);
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

  @ApiOperation({ summary: 'Получить все транзакции с фильтрами (админ)' })
  @ApiResponse({ status: 200, description: 'Список транзакций' })
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @Get()
  async getAllTransactions(@Query() filters: FilterTransactionsDto) {
    return this.transactionService.findAllWithFilters(filters);
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
