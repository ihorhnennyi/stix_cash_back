import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AdminService } from './admin/admin.service';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('💰 Stix Cash API')
    .setDescription(
      `
      **Stix Cash Backend API**

      Это серверная часть системы *Stix Cash*, которая предоставляет API для работы с:

      - ✅ Пользователями (регистрация, авторизация, refresh tokens)
      - ✅ Администраторами (отдельный модуль)
      - ✅ Финансовыми транзакциями
      - ✅ Балансами пользователей
      - ✅ Платёжными системами
      - ✅ Отчётами и аналитикой

      ⚠️ Все защищённые маршруты требуют Bearer JWT токен

      Документация по каждому модулю будет обновляться по мере разработки 🚀
      `,
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('PORT') ?? 3000;
  await app.listen(PORT);

  console.log(`🚀 Stix Cash Backend is running on: http://localhost:${PORT}`);
  console.log(`📚 Swagger Docs: http://localhost:${PORT}/api/docs`);

  // ✅ Автоматическое создание root-админа
  const adminService = app.get(AdminService);
  const rootEmail = configService.get<string>('ROOT_ADMIN_EMAIL');
  const rootPassword = configService.get<string>('ROOT_ADMIN_PASSWORD');

  if (rootEmail && rootPassword) {
    const existingAdmin = await adminService.findByEmail(rootEmail);
    if (!existingAdmin) {
      await adminService.createAdmin(rootEmail, rootPassword);
      console.log(`✅ Root admin created: ${rootEmail}`);
    } else {
      console.log(`ℹ️ Root admin already exists: ${rootEmail}`);
    }
  } else {
    console.warn(
      '⚠️ ROOT_ADMIN_EMAIL or ROOT_ADMIN_PASSWORD is missing in .env',
    );
  }
}

bootstrap().catch((err) => {
  console.error('❌ Error during bootstrap:', err);
});
