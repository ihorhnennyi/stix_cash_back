import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../user/schema/user.schema'; // 👈 Добавить
import { AdminAuthController } from './admin-auth.controller';
import { AdminUserController } from './admin-user.controller';
import { AdminUserService } from './admin-user.service';
import { AdminService } from './admin.service';
import { Admin, AdminSchema } from './schema/admin.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: User.name, schema: UserSchema }, // 👈 Добавить
    ]),
    AuthModule,
  ],
  controllers: [AdminAuthController, AdminUserController],
  providers: [AdminService, AdminUserService],
  exports: [AdminService],
})
export class AdminModule implements OnModuleInit {
  constructor(
    private readonly adminService: AdminService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const email = this.configService.get<string>('ROOT_ADMIN_EMAIL') ?? '';
    const password =
      this.configService.get<string>('ROOT_ADMIN_PASSWORD') ?? '';

    const existingAdmin = await this.adminService.findByEmail(email);
    if (!existingAdmin) {
      console.log('🚀 Creating ROOT admin...');
      await this.adminService.createAdmin(email, password);
      console.log(`✅ ROOT admin created: ${email}`);
    } else {
      console.log(`ℹ️ ROOT admin already exists: ${email}`);
    }
  }
}
