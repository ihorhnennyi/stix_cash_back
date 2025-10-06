import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, Types } from "mongoose";
import { UserFile, UserFileDocument } from "../schema/document.schema";

type CreateDocInput = {
  user: string | Types.ObjectId;
  name: string;
  relPath: string;
  mime: string;
  size: number;
};

@Injectable()
export class DocumentService {
  constructor(
    @InjectModel(UserFile.name)
    private readonly docModel: Model<UserFileDocument>
  ) {}

  /**
   * Получить все файлы пользователя (с пагинацией)
   */
  async findAllByUser(
    userId: string,
    opts?: { limit?: number; offset?: number }
  ): Promise<{ items: UserFile[]; total: number }> {
    const filter: FilterQuery<UserFileDocument> = { user: userId };
    const limit = Math.max(0, opts?.limit ?? 50);
    const offset = Math.max(0, opts?.offset ?? 0);

    const [items, total] = await Promise.all([
      this.docModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean<UserFile[]>(),
      this.docModel.countDocuments(filter),
    ]);

    return { items, total };
  }

  /**
   * Создать запись о файле
   */
  async create(doc: CreateDocInput): Promise<UserFile> {
    try {
      const payload = {
        ...doc,
        user:
          typeof doc.user === "string"
            ? new Types.ObjectId(doc.user)
            : doc.user,
      };
      const created = await this.docModel.create(payload);
      // вернуть lean, если нужно экономить память:
      return (await this.docModel.findById(created._id).lean<UserFile>())!;
    } catch (e) {
      throw new Error("Не удалось сохранить документ в базу");
    }
  }

  /**
   * Найти файл по id (lean)
   */
  async findById(id: string): Promise<UserFile | null> {
    return this.docModel.findById(id).lean<UserFile | null>();
  }

  /**
   * Удалить файл по id (бросает 404, если не найден)
   */
  async deleteById(id: string): Promise<void> {
    const res = await this.docModel.findByIdAndDelete(id);
    if (!res) {
      throw new NotFoundException("Документ не найден");
    }
  }

  /**
   * Массовое удаление файлов пользователя (например, при удалении аккаунта)
   * Возвращает количество удалённых
   */
  async deleteManyByUser(userId: string): Promise<number> {
    const r = await this.docModel.deleteMany({ user: userId });
    return r.deletedCount ?? 0;
  }
}
