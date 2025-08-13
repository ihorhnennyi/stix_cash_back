import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs/promises';
import { Model } from 'mongoose';
import * as path from 'path';

import { JwtPayload } from '../../common/types/jwt-payload.interface';

import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateMeDto } from '../dto/update-me.dto';
import { User, UserDocument } from '../schema/user.schema';
import { DocumentService } from './document.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private decodeOriginalName(name: string): string {
    try {
      return Buffer.from(name || 'file', 'latin1').toString('utf8');
    } catch {
      return name || 'file';
    }
  }

  private guessExtByMime(mime: string): string {
    const map: Record<string, string> = {
      'image/png': '.png',
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/webp': '.webp',
      'application/pdf': '.pdf',
      'text/plain': '.txt',
    };
    return map[mime] || '';
  }

  private sanitizeBase(base: string): string {
    return (base || 'file')
      .replace(/[^\p{L}\p{N}\s._-]/gu, '')
      .replace(/\s+/g, '_')
      .slice(0, 80);
  }

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @Inject(forwardRef(() => DocumentService))
    private readonly documentService: DocumentService,
    private readonly config: ConfigService,
  ) {}

  private getUsersRoot(): string {
    return (
      this.config.get<string>('USER_FILES_ROOT') ||
      path.resolve(process.cwd(), 'storage/users')
    );
  }

  private async ensureUserDir(userId: string): Promise<string> {
    const root = this.getUsersRoot();
    const userDir = path.join(root, userId);
    await fs.mkdir(userDir, { recursive: true });
    return userDir;
  }

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
      const userDir = await this.ensureUserDir(user._id.toString());
      (user as any).backendFolderPath = userDir;
      await user.save();
      this.logger.log(`Создана папка пользователя: ${userDir}`);
    } catch (err) {
      this.logger.error(
        'Не удалось создать папку пользователя на сервере',
        err,
      );
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

  async uploadFile(
    file: {
      originalname: string;
      mimetype: string;
      buffer: Buffer | ArrayBuffer;
    },
    user: JwtPayload,
  ): Promise<{
    message: string;
    file: { name: string; relPath: string; mime: string; size: number };
  }> {
    const dbUser = await this.getMe(user.sub);

    const userId = dbUser._id.toString();
    const userDir = await this.ensureUserDir(userId);

    const buffer =
      file.buffer instanceof Buffer
        ? file.buffer
        : Buffer.from(file.buffer as ArrayBuffer);

    const decoded = this.decodeOriginalName(file.originalname);
    let ext = (path.extname(decoded) || '').toLowerCase();
    let base = this.sanitizeBase(path.basename(decoded, ext));

    if (!ext) ext = this.guessExtByMime(file.mimetype);

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const rand = Math.random().toString(36).slice(2, 8);
    const name = `${base}-${stamp}-${rand}${ext}`;
    // --------------------------------------

    const absPath = path.join(userDir, name);
    await fs.writeFile(absPath, buffer);

    const relPath = path.join(userId, name);

    await this.documentService.create({
      user: userId,
      name,
      relPath,
      mime: file.mimetype,
      size: buffer.length,
    });

    if (dbUser.verificationStatus === 'unverified') {
      dbUser.verificationStatus = 'pending';
      await dbUser.save();
    }

    return {
      message: 'Файл сохранён локально',
      file: { name, relPath, mime: file.mimetype, size: buffer.length },
    };
  }

  async uploadFileToDrive(
    file: {
      originalname: string;
      mimetype: string;
      buffer: Buffer | ArrayBuffer;
    },
    user: JwtPayload,
  ) {
    return this.uploadFile(file, user);
  }

  async updateMe(userId: string, dto: UpdateMeDto): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('Пользователь не найден');

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
