import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model, Types } from 'mongoose';
import { GoogleDriveService } from '../common/services/google-drive.service';
import { JwtPayload } from '../common/types/jwt-payload.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './schema/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
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
      documents: [],
    });

    const user = await newUser.save();

    try {
      const parentId = this.googleDriveService.createMainFolderIfNotExists();
      const folderId = await this.googleDriveService.getOrCreateUserFolder(
        user._id.toString(),
        parentId,
      );
      user.googleDriveFolderId = folderId;
      await user.save();
    } catch (err) {
      console.error('Ошибка создания папки Google Drive:', err);
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
    const user = await this.userModel
      .findById(id)
      .select('-password')
      .lean(false);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const decimal128ToNumber = (value: unknown): number => {
      if (value && typeof value === 'object' && 'toString' in value) {
        return parseFloat((value as Types.Decimal128).toString());
      }
      return 0;
    };

    ({
      balance: (user as UserDocument).balance,
      balanceBTC: (user as UserDocument).balanceBTC,
    } = {
      balance: decimal128ToNumber((user as UserDocument).balance),
      balanceBTC: decimal128ToNumber((user as UserDocument).balanceBTC),
    });

    return user;
  }

  async uploadFileToDrive(
    file: {
      originalname: string;
      mimetype: string;
      buffer: Buffer | ArrayBuffer;
    },
    user: JwtPayload,
  ): Promise<{ fileId: string; webViewLink: string }> {
    const dbUser = await this.findById(user.sub);
    if (!dbUser.googleDriveFolderId) {
      throw new Error('Google Drive folder not found for user');
    }

    const buffer =
      file.buffer instanceof Buffer
        ? file.buffer
        : Buffer.from(file.buffer as ArrayBuffer);

    const fileMeta = await this.googleDriveService.uploadFileToUserFolder(
      {
        ...file,
        buffer,
      },
      dbUser.googleDriveFolderId,
    );

    dbUser.documents.push(fileMeta.webViewLink);
    await dbUser.save();

    return {
      fileId: fileMeta.id,
      webViewLink: fileMeta.webViewLink,
    };
  }
}
