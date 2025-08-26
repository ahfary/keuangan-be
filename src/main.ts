import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // Hapus { cors: true } dari sini
  const app = await NestFactory.create(AppModule);

  // Konfigurasi Validasi Global (sudah benar)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      validateCustomDecorators: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // --- Konfigurasi CORS Terpusat ---
  app.enableCors({
    origin: '*', // Izinkan semua domain (baik untuk pengembangan)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();