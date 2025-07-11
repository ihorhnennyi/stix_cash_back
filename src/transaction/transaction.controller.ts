import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

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
  @Post()
  async createUserTransaction(
    @Body() dto: CreateTransactionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.transactionService.create(user.sub, dto, false);
  }

  @ApiOperation({ summary: 'Создать транзакцию для пользователя (админ)' })
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
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @Get()
  async getAllTransactions() {
    return this.transactionService.findAll();
  }

  @ApiOperation({ summary: 'Получить мои транзакции (пользователь)' })
  @Get('my')
  async getMyTransactions(@CurrentUser() user: JwtPayload) {
    return this.transactionService.findByUser(user.sub);
  }
}
