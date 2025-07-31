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

import { CreateTransactionDto } from './dto/create-transaction.dto';
import { FilterTransactionsDto } from './dto/filter-transactions.dto';
import { TransactionDto } from './dto/transaction.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionService } from './transaction.service';

import { plainToInstance } from 'class-transformer';
import { JwtPayload } from '../common/types/jwt-payload.interface';
import { Role } from '../types/role.enum';

@ApiTags('Транзакции')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @ApiOperation({ summary: 'Создать транзакцию (пользователь)' })
  @ApiResponse({ status: 201, type: TransactionDto })
  async createUserTransaction(
    @Body() dto: CreateTransactionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const transaction = await this.transactionService.create(
      user.sub,
      dto,
      false,
    );
    return plainToInstance(TransactionDto, transaction, {
      excludeExtraneousValues: true,
    });
  }

  @Post('admin/:userId')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Создать транзакцию (админ)' })
  @ApiResponse({ status: 201, type: TransactionDto })
  async createAdminTransaction(
    @Param('userId') userId: string,
    @Body() dto: CreateTransactionDto,
  ) {
    const transaction = await this.transactionService.create(userId, dto, true);
    return plainToInstance(TransactionDto, transaction, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Редактировать транзакцию (админ)' })
  @ApiResponse({ status: 200, type: TransactionDto })
  async updateTransaction(
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    const transaction = await this.transactionService.updateByAdmin(id, dto);
    return plainToInstance(TransactionDto, transaction, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id/status')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Обновить статус транзакции (админ)' })
  @ApiResponse({ status: 200, type: TransactionDto })
  async updateTransactionStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTransactionStatusDto,
  ) {
    const transaction = await this.transactionService.updateStatus(id, dto);
    return plainToInstance(TransactionDto, transaction, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Получить все транзакции с фильтрами (админ)' })
  @ApiResponse({ status: 200, type: [TransactionDto] })
  async getAllTransactions(
    @Query() filters: FilterTransactionsDto,
  ): Promise<TransactionDto[]> {
    const transactions =
      await this.transactionService.findAllWithFilters(filters);
    return transactions.map((t) =>
      plainToInstance(TransactionDto, t.toObject(), {
        excludeExtraneousValues: true,
      }),
    );
  }

  @Get('my')
  @ApiOperation({ summary: 'Получить свои транзакции (пользователь)' })
  @ApiResponse({ status: 200, type: [TransactionDto] })
  async getMyTransactions(
    @CurrentUser() user: JwtPayload,
  ): Promise<TransactionDto[]> {
    const transactions = await this.transactionService.findByUser(user.sub);
    return plainToInstance(TransactionDto, transactions, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Получить транзакцию по ID (админ)' })
  @ApiResponse({ status: 200, type: TransactionDto })
  async getTransactionById(@Param('id') id: string): Promise<TransactionDto> {
    const transaction = await this.transactionService.findById(id);

    return plainToInstance(TransactionDto, transaction.toObject(), {
      excludeExtraneousValues: true,
    });
  }
}
