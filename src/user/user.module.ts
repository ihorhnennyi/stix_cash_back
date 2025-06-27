import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { CommonModule } from '../common/common.module';

import { UserDocument, UserDocumentSchema } from './schema/document.schema';
import { User, UserSchema } from './schema/user.schema';

import { DocumentService } from './services/document.service';
import { UserService } from './user.service';

import { UserAuthController } from './user.auth.controller';
import { UserController } from './user.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserDocument.name, schema: UserDocumentSchema },
    ]),
    CommonModule,
    AuthModule,
  ],
  providers: [UserService, DocumentService],
  controllers: [UserController, UserAuthController],
})
export class UserModule {}
