import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';
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
    const transaction = new this.transactionModel({
      user: new Types.ObjectId(userId),
      ...dto,
      amount: Types.Decimal128.fromString(dto.amount.toString()),
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

  async findAll() {
    return this.transactionModel
      .find()
      .populate('user')
      .sort({ createdAt: -1 });
  }

  async findByUser(userId: string) {
    return this.transactionModel.find({ user: userId }).sort({ createdAt: -1 });
  }
}
