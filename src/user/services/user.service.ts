import {
  forwardRef,
  Inject,
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

import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateMeDto } from '../dto/update-me.dto';
import { User, UserDocument } from '../schema/user.schema';
import { DocumentService } from './document.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly googleDriveService: GoogleDriveService,
    @Inject(forwardRef(() => DocumentService))
    private readonly documentService: DocumentService,
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
      walletBTCAddress: 'bc1qsf3q83afznd2kf5u25mgzngcl3xzmxhwwarwe0',
    });

    const user = await newUser.save();

    try {
      const parentId = this.googleDriveService.getFolderId();
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
    const user = await this.userModel.findById(id).select('-password');
    if (!user) throw new NotFoundException('Пользователь не найден');
    return user;
  }

  async uploadFileToDrive(
    file: {
      originalname: string;
      mimetype: string;
      buffer: Buffer | ArrayBuffer;
    },
    user: JwtPayload,
  ): Promise<{
    message: string;
    file: {
      fileId: string;
      webViewLink: string;
      name: string;
    };
  }> {
    const dbUser = await this.getMe(user.sub);

    if (!dbUser.googleDriveFolderId) {
      const parentFolderId = this.googleDriveService.getFolderId();
      const folderId = await this.googleDriveService.getOrCreateUserFolder(
        dbUser._id.toString(),
        parentFolderId,
      );
      dbUser.googleDriveFolderId = folderId;
      await dbUser.save();
    }

    const buffer =
      file.buffer instanceof Buffer
        ? file.buffer
        : Buffer.from(file.buffer as ArrayBuffer);

    const fileMeta = await this.googleDriveService.uploadFileToUserFolder(
      { ...file, buffer },
      dbUser.googleDriveFolderId,
    );

    console.log('File uploaded to Google Drive:', fileMeta);

    const savedDoc = await this.documentService.create({
      user: dbUser._id.toString(),
      name: file.originalname,
      fileId: fileMeta.id,
      webViewLink: fileMeta.webViewLink,
    });

    if (dbUser.verificationStatus === 'unverified') {
      dbUser.verificationStatus = 'pending';
      await dbUser.save();
    }

    return {
      message: 'Файл успешно загружен',
      file: {
        fileId: fileMeta.id,
        webViewLink: fileMeta.webViewLink,
        name: file.originalname,
      },
    };
  }

  async updateMe(userId: string, dto: UpdateMeDto): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('Пользователь не найден');

    // delete (dto as any).balance;
    // delete (dto as any).balanceBTC;

    // if (
    //   (dto as any).balance !== undefined ||
    //   (dto as any).balanceBTC !== undefined
    // ) {
    //   throw new BadRequestException(
    //     'You are not allowed to update balance fields',
    //   );
    // }

    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.country !== undefined) user.country = dto.country;
    if (dto.paypalAddress !== undefined) user.paypalAddress = dto.paypalAddress;
    if (dto.walletBTCAddress !== undefined)
      user.walletBTCAddress = dto.walletBTCAddress;

    if (dto.isTermsAccepted !== undefined)
      user.isTermsAccepted = dto.isTermsAccepted;

    if (dto.password) {
      user.password = await bcrypt.hash(dto.password, 10);
    }

    if (dto.balance !== undefined) {
      user.balance = dto.balance;
    }

    if (dto.balanceBTC !== undefined) {
      user.balanceBTC = dto.balanceBTC;
    }

    if (dto.wireTransfer) {
      user.wireTransfer = { ...user.wireTransfer, ...dto.wireTransfer };
    }

    if (dto.zelleTransfer) {
      user.zelleTransfer = { ...user.zelleTransfer, ...dto.zelleTransfer };
    }

    return user.save({ validateModifiedOnly: true });
  }
}
