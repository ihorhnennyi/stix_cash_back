import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { CommonModule } from '../common/common.module';
import { User, UserSchema } from './schema/user.schema';
import { UserAuthController } from './user.auth.controller';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    CommonModule,
    AuthModule,
  ],
  providers: [UserService],
  controllers: [UserController, UserAuthController],
})
export class UserModule {}
