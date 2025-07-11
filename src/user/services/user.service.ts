import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';

import { GoogleDriveService } from '../../common/services/google-drive.service';
import { JwtPayload } from '../../common/types/jwt-payload.interface';
import { decimal128ToNumber } from '../../utils/mongo.utils';

import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateMeDto } from '../dto/update-me.dto';
import { User, UserDocument } from '../schema/user.schema';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

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
      this.logger.error('Ошибка создания папки Google Drive', err);
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

  async getMe(id: string): Promise<UserDocument> {
    const user = await this.userModel
      .findById(id)
      .select('-password')
      .lean(false);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const doc = user.toObject();

    doc.balance = decimal128ToNumber(user.balance);
    doc.balanceBTC = decimal128ToNumber(user.balanceBTC);

    return doc as UserDocument;
  }

  async uploadFileToDrive(
    file: {
      originalname: string;
      mimetype: string;
      buffer: Buffer | ArrayBuffer;
    },
    user: JwtPayload,
  ): Promise<{ fileId: string; webViewLink: string }> {
    const dbUser = await this.getMe(user.sub);
    if (!dbUser.googleDriveFolderId) {
      throw new Error('Google Drive folder not found for user');
    }

    const buffer =
      file.buffer instanceof Buffer
        ? file.buffer
        : Buffer.from(file.buffer as ArrayBuffer);

    const fileMeta = await this.googleDriveService.uploadFileToUserFolder(
      { ...file, buffer },
      dbUser.googleDriveFolderId,
    );

    dbUser.documents.push(fileMeta.webViewLink);
    await dbUser.save();

    return {
      fileId: fileMeta.id,
      webViewLink: fileMeta.webViewLink,
    };
  }

  async updateMe(userId: string, dto: UpdateMeDto): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('Пользователь не найден');

    delete (dto as any).isVerified;
    delete (dto as any).showBTCBalance;
    delete (dto as any).balanceBTC;
    delete (dto as any).balance;

    if ((dto as any).password) {
      user.password = await bcrypt.hash((dto as any).password, 10);
      delete (dto as any).password;
    }

    Object.assign(user, {
      ...dto,
      wireTransfer: dto.wireTransfer
        ? { ...user.wireTransfer, ...dto.wireTransfer }
        : user.wireTransfer,
      zelleTransfer: dto.zelleTransfer
        ? { ...user.zelleTransfer, ...dto.zelleTransfer }
        : user.zelleTransfer,
    });

    return user.save();
  }
}
