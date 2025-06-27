import { Module } from '@nestjs/common';
import { GoogleDriveService } from '../common/services/google-drive.service';
import { TestController } from './test.controller';

@Module({
  controllers: [TestController],
  providers: [GoogleDriveService],
})
export class TestModule {}
