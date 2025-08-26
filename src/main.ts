import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
<<<<<<< HEAD
  // Hapus { cors: true } dari sini
  const app = await NestFactory.create(AppModule);

  // Konfigurasi Validasi Global (sudah benar)
=======
  const app = await NestFactory.create(AppModule, { cors: true });
>>>>>>> 2b8b37ef3f6d535787780d94badd1959d8fcda5d
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
<<<<<<< HEAD
      validateCustomDecorators: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // --- Konfigurasi CORS Terpusat ---
=======
      validateCustomDecorators : true,
      transformOptions: {
        enableImplicitConversion: true
      }
    })
  )
>>>>>>> 2b8b37ef3f6d535787780d94badd1959d8fcda5d
  app.enableCors({
    origin: '*', // Izinkan semua domain (baik untuk pengembangan)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();