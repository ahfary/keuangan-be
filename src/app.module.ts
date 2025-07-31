import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './app/prisma/prisma.module';
import { AuthModule } from './app/auth/auth.module';
import { SantriModule } from './app/santri/santri.module';
import { ItemsModule } from './app/items/items.module';
import { CloudinaryModule } from './app/cloudinary/cloudinary.module';
import { CartModule } from './app/cart/cart.module';
import { HistoryModule } from './app/history/history.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Global()
@Module({
  imports: [
    // ConfigModule.forRoot({
    //   isGlobal: true, // konfigurasi is global untuk semua module
    // }),
    // TypeOrmModule.forRootAsync({
    //   useFactory: async () => {
    //     const { typeOrmConfig } = await import('./config/typeorm.config');
    //     return typeOrmConfig;
    //   },
    // }),
    PrismaModule,
    AuthModule,
    SantriModule,
    ItemsModule,
    CloudinaryModule,
    CartModule,
    HistoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
