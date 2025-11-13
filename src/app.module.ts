import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './app/prisma/prisma.module';
import { AuthModule } from './app/auth/auth.module';
import { SantriModule } from './app/santri/santri.module';
import { ItemsModule } from './app/items/items.module';
import { CloudinaryModule } from './app/cloudinary/cloudinary.module';
import { HistoryModule } from './app/history/history.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KategoriModule } from './app/kategori/kategori.module';
import { TransaksiModule } from './app/transaksi/transaksi.module';
import { KartuModule } from './app/kartu/kartu.module';
import { WebsocketModule } from './app/websocket/websocket.module';
import { MailModule } from './app/mail/mail.module';
import { MidtransModule } from './app/midtrans/midtrans.module';
import { WinpayModule } from './app/winpay/winpay.module';
import { TagihanModule } from './app/tagihan/tagihan.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // konfigurasi is global untuk semua module
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const { typeOrmConfig } = await import('./config/typeorm.config');
        return typeOrmConfig;
      },
    }),
    AuthModule,
    SantriModule,
    ItemsModule,
    CloudinaryModule,
    HistoryModule,
    KategoriModule,
    TransaksiModule,
    MidtransModule,
    KartuModule,
    WebsocketModule,
    MailModule,
    WinpayModule,
    TagihanModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
