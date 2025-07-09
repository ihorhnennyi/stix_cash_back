import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drive_v3, google } from 'googleapis';
import { join } from 'path';
import { Readable } from 'stream';

@Injectable()
export class GoogleDriveService implements OnModuleInit {
  private drive: drive_v3.Drive;
  private folderId: string | null = null;
  private serviceAccountEmail: string;

  constructor(private readonly configService: ConfigService) {
    this.serviceAccountEmail = this.configService.get<string>(
      'GOOGLE_SERVICE_EMAIL',
    )!;
  }

  onModuleInit() {
    const keyPath = join(
      __dirname,
      '../../../',
      this.configService.get<string>('GOOGLE_KEY_FILE') || '',
    );

    const auth = new google.auth.GoogleAuth({
      keyFile: keyPath,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    this.drive = google.drive({
      version: 'v3',
      auth,
    });
  }

  createMainFolderIfNotExists(): string {
    if (this.folderId) return this.folderId;

    const folderIdFromEnv = this.configService.get<string>(
      'GOOGLE_DRIVE_PARENT_FOLDER_ID',
    );
    if (!folderIdFromEnv) {
      throw new Error('GOOGLE_DRIVE_PARENT_FOLDER_ID is not set');
    }

    this.folderId = folderIdFromEnv;
    return this.folderId;
  }

  async createUserFolder(
    userId: string,
    parentFolderId: string,
  ): Promise<string> {
    const folder = await this.drive.files.create({
      requestBody: {
        name: userId,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolderId],
      },
      fields: 'id',
    });

    const folderId = folder.data.id!;
    console.log('[GoogleDrive] Folder created:', folderId);
    return folderId;
  }

  async getOrCreateUserFolder(
    userId: string,
    parentFolderId: string,
    existingFolderId?: string,
  ): Promise<string> {
    if (existingFolderId) {
      try {
        const file = await this.drive.files.get({
          fileId: existingFolderId,
          fields: 'id',
        });

        if (file.data.id) {
          return file.data.id;
        }
      } catch {
        console.warn(
          `[GoogleDrive] Папка с ID ${existingFolderId} не найдена или удалена — создаём заново`,
        );
      }
    }

    return this.createUserFolder(userId, parentFolderId);
  }

  async uploadFileToUserFolder(
    file: { originalname: string; mimetype: string; buffer: Buffer },
    folderId: string,
  ): Promise<{ id: string; webViewLink: string }> {
    const bufferStream = new Readable();
    bufferStream.push(file.buffer);
    bufferStream.push(null);

    const res = await this.drive.files.create({
      requestBody: {
        name: file.originalname,
        mimeType: file.mimetype,
        parents: [folderId],
      },
      media: {
        mimeType: file.mimetype,
        body: bufferStream,
      },
      fields: 'id, webViewLink',
    });

    return {
      id: res.data.id!,
      webViewLink: res.data.webViewLink!,
    };
  }

  async deleteAllFolders(): Promise<void> {
    const res = await this.drive.files.list({
      q: "mimeType='application/vnd.google-apps.folder' and trashed = false",
      fields: 'files(id, name, owners)',
    });

    const folders = res.data.files ?? [];

    if (folders.length === 0) {
      console.log('Нет папок для удаления');
      return;
    }

    console.log(`Найдено ${folders.length} папок. Начинаем удаление...`);

    for (const folder of folders) {
      const folderId = folder.id!;
      const folderName = folder.name;

      try {
        const isOwnedByServiceAccount = folder.owners?.some((owner) =>
          owner.emailAddress?.includes('@gserviceaccount.com'),
        );

        if (!isOwnedByServiceAccount) {
          console.warn(
            `[GoogleDrive] Папка не принадлежит сервисному аккаунту: ${folderName}`,
          );

          await this.drive.permissions.create({
            fileId: folderId,
            requestBody: {
              type: 'user',
              role: 'writer',
              emailAddress: this.serviceAccountEmail,
            },
            fields: 'id',
          });

          console.log(
            `[GoogleDrive] Права редактора добавлены к папке: ${folderName}`,
          );
        }

        await this.drive.files.delete({ fileId: folderId });
        console.log(`Удалена папка: ${folderName} (${folderId})`);
      } catch (err: unknown) {
        let message = 'Неизвестная ошибка';
        if (
          typeof err === 'object' &&
          err !== null &&
          'message' in err &&
          typeof (err as { message?: unknown }).message === 'string'
        ) {
          message = (err as { message: string }).message;
        }
        console.error(`Ошибка при удалении папки ${folderName}:`, message);
      }
    }

    console.log('Очистка завершена');
  }
}
