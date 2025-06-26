import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:5173',
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
  SwaggerModule.setup('api/docs', app, document);

  const PORT = process.env.PORT ?? 3000;
  await app.listen(PORT);

  console.log(`Stix Cash Backend is running!`);
  console.log(`API available at: http://localhost:${PORT}/api`);
  console.log(`Swagger Docs:    http://localhost:${PORT}/api/docs`);
}

bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
});
