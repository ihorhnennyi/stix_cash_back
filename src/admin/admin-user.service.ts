import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { User, UserDocument } from '../user/schema/user.schema';
import { FilterUserDto } from './dto/filter-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AdminUserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async getAllUsers(filter?: FilterUserDto): Promise<UserDocument[]> {
    const query: FilterQuery<UserDocument> = {};

    if (filter?.email) {
      query.email = { $regex: filter.email, $options: 'i' };
    }

    if (filter?.role) {
      query.roles = filter.role;
    }

    if (filter?.isVerified !== undefined) {
      query.isVerified = filter.isVerified;
    }

    if (
      typeof filter?.balanceFrom === 'number' ||
      typeof filter?.balanceTo === 'number'
    ) {
      const balanceQuery: Partial<Record<'$gte' | '$lte', number>> = {};

      if (typeof filter.balanceFrom === 'number') {
        balanceQuery.$gte = filter.balanceFrom;
      }
      if (typeof filter.balanceTo === 'number') {
        balanceQuery.$lte = filter.balanceTo;
      }

      query.balance = balanceQuery;
    }

    if (filter?.createdFrom || filter?.createdTo) {
      const createdAtQuery: Partial<Record<'$gte' | '$lte', Date>> = {};

      if (filter.createdFrom) {
        createdAtQuery.$gte = new Date(filter.createdFrom);
      }
      if (filter.createdTo) {
        createdAtQuery.$lte = new Date(filter.createdTo);
      }

      query.createdAt = createdAtQuery;
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

  async getUserById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).lean();
    if (!user) throw new NotFoundException('Пользователь не найден');
    return user;
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(id, dto, {
      new: true,
      runValidators: true,
    });
    if (!user) throw new NotFoundException('Пользователь не найден');
    return user;
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Пользователь не найден');
    return { message: 'Пользователь удалён' };
  }
}
