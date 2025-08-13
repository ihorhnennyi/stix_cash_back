import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { CommonModule } from '../common/common.module';

import { UserFile, UserFileSchema } from './schema/document.schema';
import { User, UserSchema } from './schema/user.schema';

import { DocumentService } from './services/document.service';
import { UserService } from './services/user.service';

import { UserAuthController } from './user.auth.controller';
import { UserController } from './user.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserFile.name, schema: UserFileSchema },
    ]),
    forwardRef(() => CommonModule),
    forwardRef(() => AuthModule),
  ],
  providers: [UserService, DocumentService],
  controllers: [UserController, UserAuthController],
  exports: [UserService, DocumentService],
})
export class UserModule {}
