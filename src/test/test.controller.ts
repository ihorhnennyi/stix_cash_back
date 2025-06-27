import { Controller, Post } from '@nestjs/common';
import { GoogleDriveService } from '../common/services/google-drive.service';

@Controller('test')
export class TestController {
  constructor(private readonly googleDriveService: GoogleDriveService) {}

  @Post('delete-folders')
  async deleteAllFolders(): Promise<{ success: boolean }> {
    await this.googleDriveService.deleteAllFolders();
    return { success: true };
  }
}
