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

  async findAllByUser(userId: string) {
    return this.docModel.find({ user: userId }).sort({ createdAt: -1 }).lean();
  }

  async create(doc: {
    user: string;
    name: string;
    fileId: string;
    webViewLink: string;
  }) {
    return this.docModel.create(doc);
  }
}
