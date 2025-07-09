import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../user/schema/user.schema';
import { AdminAuthController } from './admin-auth.controller';
import { AdminUserController } from './admin-user.controller';
import { AdminUserService } from './admin-user.service';
import { AdminService } from './admin.service';
import { Admin, AdminSchema } from './schema/admin.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuthModule,
  ],
  controllers: [AdminAuthController, AdminUserController],
  providers: [AdminService, AdminUserService],
  exports: [AdminService],
})
export class AdminModule implements OnModuleInit {
  private readonly logger = new Logger(AdminModule.name);

  constructor(
    private readonly adminService: AdminService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const email = this.configService.get<string>('ROOT_ADMIN_EMAIL');
    const password = this.configService.get<string>('ROOT_ADMIN_PASSWORD');

    if (!email || !password) {
      this.logger.warn('ROOT_ADMIN_EMAIL или ROOT_ADMIN_PASSWORD не заданы');
      return;
    }

    const existingAdmin = await this.adminService.findByEmail(email);
    if (!existingAdmin) {
      this.logger.log('Создаётся ROOT администратор...');
      await this.adminService.createAdmin(email, password);
      this.logger.log(`ROOT администратор создан: ${email}`);
    } else {
      this.logger.log(`ROOT администратор уже существует: ${email}`);
    }
  }
}
