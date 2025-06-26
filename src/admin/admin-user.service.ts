import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/schema/user.schema';
import { FilterUserDto } from './dto/filter-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AdminUserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async getAllUsers(filter?: FilterUserDto): Promise<{
    data: UserDocument[];
    total: number;
    page: number;
    limit: number;
  }> {
    const query: Record<string, any> = {};

    if (filter?.email) {
      query.email = { $regex: filter.email, $options: 'i' };
    }

    if (filter?.role) {
      query.roles = filter.role;
    }

    if (filter?.isVerified !== undefined) {
      query.isVerified = filter.isVerified;
    }

    const page = filter?.page && filter.page > 0 ? filter.page : 1;
    const limit = filter?.limit && filter.limit > 0 ? filter.limit : 20;
    const skip = (page - 1) * limit;

    const sortBy = filter?.sortBy ?? 'createdAt';
    const sortOrder = filter?.sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.userModel
        .find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.userModel.countDocuments(query),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
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
