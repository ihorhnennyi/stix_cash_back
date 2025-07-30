import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import Big from 'big.js';
import { Model, Types } from 'mongoose';
import { TransactionType } from 'src/types/transaction-type.enum';
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
      throw new BadRequestException('Invalid userId');
    }

    const user = await this.transactionModel.db
      .collection('users')
      .findOne({ _id: new Types.ObjectId(userId) });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const pendingExists = await this.transactionModel.exists({
      user: new Types.ObjectId(userId),
      status: 'pending',
    });

    if (pendingExists) {
      throw new BadRequestException(
        'Невозможно создать новую транзакцию: есть ожидающая (pending) транзакция',
      );
    }

    const amount = new Big(dto.amount || '0');
    if (amount.lte(0)) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    const currentBalance =
      dto.currency === 'BTC'
        ? new Big(user.balanceBTC || '0')
        : new Big(user.balance || '0');

    let updatedBalance: Big;

    if (dto.type === TransactionType.Deposit) {
      updatedBalance = currentBalance.plus(amount);
    } else if (dto.type === TransactionType.Withdrawal) {
      if (currentBalance.lt(amount)) {
        throw new BadRequestException('Недостаточно средств для вывода');
      }
      updatedBalance = currentBalance.minus(amount);
    } else {
      throw new BadRequestException('Неверный тип транзакции');
    }

    const transaction = new this.transactionModel({
      user: new Types.ObjectId(userId),
      type: dto.type,
      amount: dto.amount,
      balance: updatedBalance.toString(),
      currency: dto.currency,
      method: dto.method,
      note: dto.note,
      date: dto.date,
      transactionId: dto.transactionId,
      status: dto.status || 'pending',
      createdByAdmin,
    });

    await transaction.save();

    const balanceField = dto.currency === 'BTC' ? 'balanceBTC' : 'balance';
    await this.transactionModel.db
      .collection('users')
      .updateOne(
        { _id: new Types.ObjectId(userId) },
        { $set: { [balanceField]: updatedBalance.toString() } },
      );

    return this.transactionModel.findById(transaction._id).populate('user');
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

    Object.assign(transaction, dto);
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

    if (userId) query.user = new Types.ObjectId(userId);
    if (status) query.status = status;

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
