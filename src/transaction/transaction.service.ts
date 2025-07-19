import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateTransactionDto } from './dto/create-transaction.dto';
import { FilterTransactionsDto } from './dto/filter-transactions.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
  ) {}

  async create(
    userId: string,
    dto: CreateTransactionDto,
    createdByAdmin = false,
  ) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid userId');
    }

    const transaction = new this.transactionModel({
      user: new Types.ObjectId(userId),
      type: dto.type,
      amount: Types.Decimal128.fromString(dto.amount),
      balance: Types.Decimal128.fromString(dto.balance),
      currency: dto.currency,
      method: dto.method,
      note: dto.note,
      date: dto.date,
      transactionId: dto.transactionId,
      status: dto.status,
      createdByAdmin,
    });

    return transaction.save();
  }

  async updateStatus(id: string, dto: UpdateTransactionStatusDto) {
    const transaction = await this.transactionModel.findById(id);
    if (!transaction) throw new NotFoundException('Транзакция не найдена');

    transaction.status = dto.status;
    return transaction.save();
  }

  async updateByAdmin(id: string, dto: UpdateTransactionDto) {
    const transaction = await this.transactionModel.findById(id);
    if (!transaction) throw new NotFoundException('Транзакция не найдена');

    if (dto.type) transaction.type = dto.type;
    if (dto.amount) transaction.amount = dto.amount;
    if (dto.balance) transaction.balance = dto.balance;
    if (dto.currency) transaction.currency = dto.currency;
    if (dto.method)
      transaction.method = dto.method as
        | 'walletBTCAddress'
        | 'wireTransfer'
        | 'zelleTransfer'
        | 'paypalAddress';

    if (dto.note) transaction.note = dto.note;
    if (dto.date) transaction.date = dto.date;
    if (dto.transactionId) transaction.transactionId = dto.transactionId;
    if (dto.status) transaction.status = dto.status;

    return transaction.save();
  }

  async findAll(): Promise<TransactionDocument[]> {
    return this.transactionModel
      .find()
      .populate('user')
      .sort({ createdAt: -1 });
  }

  async findByUser(userId: string): Promise<TransactionDocument[]> {
    return this.transactionModel
      .find({ user: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 });
  }

  async findById(id: string): Promise<TransactionDocument> {
    const transaction = await this.transactionModel
      .findById(id)
      .populate('user');

    if (!transaction) {
      throw new NotFoundException('Транзакция не найдена');
    }

    return transaction;
  }

  async findAllWithFilters(
    filters: FilterTransactionsDto,
  ): Promise<TransactionDocument[]> {
    const { userId, from, to, status } = filters;
    const query: any = {};

    if (userId) {
      query.user = new Types.ObjectId(userId);
    }

    if (status) {
      query.status = status;
    }

    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    return this.transactionModel
      .find(query)
      .populate('user')
      .sort({ createdAt: -1 });
  }
}
