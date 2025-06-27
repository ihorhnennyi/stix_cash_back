import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { GoogleDriveService } from '../common/services/google-drive.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './schema/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private readonly googleDriveService: GoogleDriveService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<UserDocument> {
    const existing = await this.userModel.exists({ email: dto.email });
    if (existing) {
      throw new UnauthorizedException(
        'Пользователь с таким email уже существует',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = new this.userModel({
      ...dto,
      password: hashedPassword,
      roles: ['user'],
      isVerified: false,
    });

    const user = await newUser.save();

    try {
      const mainFolderId: string =
        await this.googleDriveService.createMainFolderIfNotExists();

      const folderId = await this.googleDriveService.createUserFolder(
        user._id.toString(),
        mainFolderId,
      );

      user.googleDriveFolderId = folderId;
      await user.save();
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Ошибка создания папки Google Drive:', err.message);
      } else {
        console.error('Ошибка создания папки Google Drive:', err);
      }
    }
    return user;
  }

  async validateUser(email: string, password: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный пароль');
    }

    return user;
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }
}
