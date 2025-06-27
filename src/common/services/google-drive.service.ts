import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drive_v3, google } from 'googleapis';
import { join } from 'path';

@Injectable()
export class GoogleDriveService implements OnModuleInit {
  private drive: drive_v3.Drive;
  private folderId: string | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const keyPath = join(
      __dirname,
      '../../../',
      this.configService.get<string>('GOOGLE_KEY_FILE') || '',
    );

    const auth = new google.auth.JWT({
      keyFile: keyPath,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    await auth.authorize();
    this.drive = google.drive({ version: 'v3', auth });
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

    await this.drive.permissions.create({
      fileId: folderId,
      requestBody: {
        type: 'user',
        role: 'writer',
        emailAddress: this.configService.get<string>('GOOGLE_DRIVE_OWNER'),
      },
    });

    return folderId;
  }

  async deleteAllFolders(): Promise<void> {
    const res = await this.drive.files.list({
      q: "mimeType='application/vnd.google-apps.folder' and trashed = false",
      fields: 'files(id, name)',
    });

    const folders = res.data.files ?? [];

    if (folders.length === 0) {
      console.log('Нет папок для удаления');
      return;
    }

    console.log(`Удаление ${folders.length} папок...`);

    for (const folder of folders) {
      try {
        await this.drive.files.delete({ fileId: folder.id! });
        console.log(`Удалена папка: ${folder.name} (${folder.id})`);
      } catch (err) {
        console.error(
          `Ошибка при удалении папки ${folder.name}:`,
          err && typeof err === 'object' && 'message' in err
            ? (err as { message: string }).message
            : err,
        );
      }
    }

    console.log('🧼 Очистка завершена');
  }
}
