import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs/promises';
import { FilterQuery, Model } from 'mongoose';
import * as path from 'path';

import { UpdateUserDto } from '../user/dto/update-user.dto';
import { User, UserDocument } from '../user/schema/user.schema';
import { FilterUserDto } from './dto/filter-user.dto';

@Injectable()
export class AdminUserService {
  private readonly logger = new Logger(AdminUserService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly config: ConfigService,
  ) {}

  private getUsersRoot(): string {
    return (
      this.config.get<string>('USER_FILES_ROOT') ||
      path.resolve(process.cwd(), 'storage/users')
    );
  }

  private getUserDir(userId: string): string {
    return path.join(this.getUsersRoot(), userId);
  }

  private async removeUserDir(userId: string): Promise<void> {
    const dir = this.getUserDir(userId);
    try {
      await fs.rm(dir, { recursive: true, force: true });
      this.logger.log(`Папка пользователя удалена: ${dir}`);
    } catch (e) {
      this.logger.error(
        `Не удалось удалить папку пользователя: ${dir}`,
        e as any,
      );
    }
  }

  async getAllUsers(filter?: FilterUserDto): Promise<User[]> {
    const query: FilterQuery<UserDocument> = {};

    if (filter?.email) {
      query.email = { $regex: filter.email, $options: 'i' };
    }
    if (filter?.role) {
      query.roles = filter.role;
    }
    if (filter?.verificationStatus) {
      query.verificationStatus = filter.verificationStatus as any;
    }
    if (
      typeof filter?.balanceFrom === 'number' ||
      typeof filter?.balanceTo === 'number'
    ) {
      const balanceQuery: Record<string, number> = {};
      if (typeof filter.balanceFrom === 'number')
        balanceQuery.$gte = filter.balanceFrom;
      if (typeof filter.balanceTo === 'number')
        balanceQuery.$lte = filter.balanceTo;
      query.balance = balanceQuery as any;
    }
    if (filter?.createdFrom || filter?.createdTo) {
      const createdAtQuery: Record<string, Date> = {};
      if (filter.createdFrom)
        createdAtQuery.$gte = new Date(filter.createdFrom);
      if (filter.createdTo) createdAtQuery.$lte = new Date(filter.createdTo);
      query.createdAt = createdAtQuery as any;
    }

    const sort: Record<string, 1 | -1> = {};
    if (filter?.sortBy) {
      sort[filter.sortBy] = filter.sortOrder === 'asc' ? 1 : -1;
    } else {
      sort.createdAt = -1;
    }

    const page = filter?.page ?? 1;
    const limit = filter?.limit ?? 20;

    return this.userModel
      .find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).lean();
    if (!user) throw new NotFoundException('Пользователь не найден');
    return user;
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('Пользователь не найден');

    if (dto.password) {
      user.password = await bcrypt.hash(dto.password, 10);
    }

    if (dto.balance !== undefined) user.balance = dto.balance as any;
    if (dto.balanceBTC !== undefined) user.balanceBTC = dto.balanceBTC as any;
    if (dto.isTransactionAllowed !== undefined)
      user.isTransactionAllowed = dto.isTransactionAllowed;
    if (dto.showBTCBalance !== undefined)
      user.showBTCBalance = dto.showBTCBalance;

    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.country !== undefined) user.country = dto.country;
    if (dto.walletBTCAddress !== undefined)
      user.walletBTCAddress = dto.walletBTCAddress;
    if (dto.paypalAddress !== undefined) user.paypalAddress = dto.paypalAddress;

    if (dto.wireTransfer)
      user.wireTransfer = { ...user.wireTransfer, ...dto.wireTransfer };
    if (dto.zelleTransfer)
      user.zelleTransfer = { ...user.zelleTransfer, ...dto.zelleTransfer };

    if (dto.verificationStatus !== undefined) {
      const oldStatus = user.verificationStatus;
      const newStatus = dto.verificationStatus;
      user.verificationStatus = newStatus;

      if (newStatus === 'verified' && oldStatus !== 'verified') {
        await this.removeUserDir(user._id.toString());
        if ((user as any).backendFolderPath) {
          (user as any).backendFolderPath = '';
        }
      }
    }

    return user.save();
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Пользователь не найден');

    await this.removeUserDir(id);

    return { message: 'Пользователь удалён' };
  }
}
