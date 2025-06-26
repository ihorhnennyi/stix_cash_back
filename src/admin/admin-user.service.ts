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

  async getAllUsers(filter?: FilterUserDto): Promise<UserDocument[]> {
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

    return this.userModel.find(query).lean();
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
