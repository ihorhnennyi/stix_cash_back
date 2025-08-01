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

    const user = await this.getUserById(userId);

    const existing = await this.transactionModel.findOne({
      user: new Types.ObjectId(userId),
      status: 'pending',
    });

    if (existing) {
      throw new BadRequestException(
        'У вас уже есть неподтверждённая транзакция. Дождитесь её обработки.',
      );
    }

    const amount = new Big(dto.amount || '0');
    this.validateAmount(amount);

    const currentBalance = this.getCurrentBalance(user, dto.currency);
    const updatedBalance = this.calculateUpdatedBalance(
      currentBalance,
      amount,
      dto.type,
    );

    const {
      type,
      amount: dtoAmount,
      currency,
      method,
      note,
      date,
      transactionId,
      status,
      ...paymentDetails
    } = dto;

    const transaction = new this.transactionModel({
      user: new Types.ObjectId(userId),
      type,
      amount: dtoAmount,
      balance: updatedBalance.toString(),
      currency,
      method,
      note,
      date,
      transactionId,
      status: status || 'pending',
      createdByAdmin,
      ...paymentDetails,
    });

    await transaction.save();

    const isCompletedByAdmin =
      createdByAdmin && transaction.status === 'completed';

    if (isCompletedByAdmin) {
      await this.updateUserBalance(userId, currency, updatedBalance.toString());
    }

    return transaction.populate('user');
  }

  async updateStatus(id: string, dto: UpdateTransactionStatusDto) {
    const transaction = await this.transactionModel.findById(id);
    if (!transaction) {
      throw new NotFoundException('Транзакция не найдена');
    }

    const prevStatus = transaction.status;
    transaction.status = dto.status;

    if (prevStatus !== 'completed' && dto.status === 'completed') {
      const user = await this.getUserById(transaction.user.toString());

      const amount = new Big(transaction.amount || '0');
      this.validateAmount(amount);

      const currentBalance = this.getCurrentBalance(user, transaction.currency);

      const updatedBalance = this.calculateUpdatedBalance(
        currentBalance,
        amount,
        transaction.type as TransactionType,
      );

      await this.updateUserBalance(
        transaction.user.toString(),
        transaction.currency,
        updatedBalance.toString(),
      );

      transaction.balance = updatedBalance.toString();
    }

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

  // ────────────────────────────────────────────────
  // 🔒 Приватные вспомогательные методы
  // ────────────────────────────────────────────────

  private validateAmount(amount: Big) {
    if (amount.lte(0)) {
      throw new BadRequestException('Amount must be greater than zero');
    }
  }

  private getCurrentBalance(user: any, currency: string): Big {
    return currency === 'BTC'
      ? new Big(user.balanceBTC || '0')
      : new Big(user.balance || '0');
  }

  private calculateUpdatedBalance(
    currentBalance: Big,
    amount: Big,
    type: TransactionType,
  ): Big {
    if (type === TransactionType.Deposit) {
      return currentBalance.plus(amount);
    }
    if (type === TransactionType.Withdrawal) {
      if (currentBalance.lt(amount)) {
        throw new BadRequestException('Недостаточно средств для вывода');
      }
      return currentBalance.minus(amount);
    }
    throw new BadRequestException('Неверный тип транзакции');
  }

  private async updateUserBalance(
    userId: string,
    currency: string,
    updatedBalance: string,
  ) {
    const balanceField = currency === 'BTC' ? 'balanceBTC' : 'balance';
    await this.transactionModel.db
      .collection('users')
      .updateOne(
        { _id: new Types.ObjectId(userId) },
        { $set: { [balanceField]: updatedBalance } },
      );
  }

  private async getUserById(userId: string) {
    const user = await this.transactionModel.db
      .collection('users')
      .findOne({ _id: new Types.ObjectId(userId) });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }
}
