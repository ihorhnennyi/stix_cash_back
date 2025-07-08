import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from '../schema/document.schema';

@Injectable()
export class DocumentService {
  constructor(
    @InjectModel(UserDocument.name)
    private readonly docModel: Model<UserDocument>,
  ) {}

  async findAllByUser(userId: string): Promise<UserDocument[]> {
    return this.docModel.find({ user: userId }).sort({ createdAt: -1 }).lean();
  }

  async create(doc: {
    user: string;
    name: string;
    fileId: string;
    webViewLink: string;
  }): Promise<UserDocument> {
    try {
      return await this.docModel.create(doc);
    } catch (err) {
      throw new Error('Не удалось сохранить документ в базу');
    }
  }

  async deleteById(id: string): Promise<void> {
    await this.docModel.findByIdAndDelete(id);
  }
}
