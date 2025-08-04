import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  GoogleToken,
  GoogleTokenDocument,
} from '../schemas/google-token.schema';

@Injectable()
export class GoogleTokenService {
  constructor(
    @InjectModel(GoogleToken.name)
    private readonly tokenModel: Model<GoogleTokenDocument>,
  ) {}

  async getToken(): Promise<GoogleTokenDocument> {
    const token = await this.tokenModel.findOne();
    if (!token) {
      throw new Error('Google OAuth токен не найден в базе');
    }
    return token;
  }

  async updateToken(data: Partial<GoogleToken>): Promise<void> {
    const token = await this.tokenModel.findOne();

    if (token) {
      Object.assign(token, data);
      await token.save();
    } else {
      await this.tokenModel.create(data);
    }
  }
}
