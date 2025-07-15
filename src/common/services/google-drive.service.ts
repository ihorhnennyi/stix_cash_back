import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drive_v3, google } from 'googleapis';
import { Readable } from 'stream';

@Injectable()
export class GoogleDriveService implements OnModuleInit {
  private drive: drive_v3.Drive;
  private folderId: string;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const oAuth2Client = new google.auth.OAuth2(
      this.configService.get('GOOGLE_CLIENT_ID'),
      this.configService.get('GOOGLE_CLIENT_SECRET'),
      this.configService.get('GOOGLE_REDIRECT_URI'),
    );

    oAuth2Client.setCredentials({
      refresh_token: this.configService.get('GOOGLE_REFRESH_TOKEN'),
    });

    this.drive = google.drive({
      version: 'v3',
      auth: oAuth2Client,
    });

    const folderId = this.configService.get<string>(
      'GOOGLE_DRIVE_PARENT_FOLDER_ID',
    );
    if (!folderId) {
      throw new Error('GOOGLE_DRIVE_PARENT_FOLDER_ID is not set');
    }

    this.folderId = folderId;
  }

  getFolderId(): string {
    return this.folderId;
  }

  async uploadFile(file: {
    originalname: string;
    mimetype: string;
    buffer: Buffer;
  }): Promise<{ id: string; webViewLink: string }> {
    const bufferStream = new Readable();
    bufferStream.push(file.buffer);
    bufferStream.push(null);

    const res = await this.drive.files.create({
      requestBody: {
        name: file.originalname,
        mimeType: file.mimetype,
        parents: [this.folderId],
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

  async getOrCreateUserFolder(
    userId: string,
    parentFolderId: string,
  ): Promise<string> {
    const folderName = userId;

    const existing = await this.drive.files.list({
      q: `'${parentFolderId}' in parents and name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name)',
    });

    if (existing.data.files && existing.data.files.length > 0) {
      return existing.data.files[0].id!;
    }

    const folder = await this.drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolderId],
      },
      fields: 'id',
    });

    return folder.data.id!;
  }

  async uploadFileToUserFolder(
    file: {
      originalname: string;
      mimetype: string;
      buffer: Buffer;
    },
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

  async deleteFileById(fileId: string): Promise<void> {
    await this.drive.files.delete({ fileId });
  }
}
