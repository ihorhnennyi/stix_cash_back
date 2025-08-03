import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GoogleToken, GoogleTokenSchema } from './schemas/google-token.schema';
import { GoogleDriveService } from './services/google-drive.service';
import { GoogleTokenService } from './services/google-token.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GoogleToken.name, schema: GoogleTokenSchema },
    ]),
  ],
  providers: [GoogleDriveService, GoogleTokenService],
  exports: [GoogleDriveService],
})
export class CommonModule {}
