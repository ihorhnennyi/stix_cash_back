import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserFile, UserFileDocument } from '../schema/document.schema';

@Injectable()
export class DocumentService {
  constructor(
    @InjectModel(UserFile.name)
    private readonly docModel: Model<UserFileDocument>,
  ) {}

  async findAllByUser(userId: string): Promise<UserFile[]> {
    return this.docModel.find({ user: userId }).sort({ createdAt: -1 }).lean();
  }

  async create(doc: {
    user: string;
    name: string;
    relPath: string;
    mime: string;
    size: number;
  }): Promise<UserFile> {
    try {
      return await this.docModel.create(doc);
    } catch {
      throw new Error('Не удалось сохранить документ в базу');
    }
  }

  async deleteById(id: string): Promise<void> {
    await this.docModel.findByIdAndDelete(id);
  }
}
