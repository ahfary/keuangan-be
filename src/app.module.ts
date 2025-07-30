import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './app/prisma/prisma.module';
import { AuthModule } from './app/auth/auth.module';
import { SantriModule } from './app/santri/santri.module';
import { ItemsModule } from './app/items/items.module';
import { CloudinaryModule } from './app/cloudinary/cloudinary.module';
import { CartModule } from './app/cart/cart.module';
import { HistoryModule } from './app/history/history.module';

@Global()
@Module({
  imports: [PrismaModule, AuthModule, SantriModule, ItemsModule, CloudinaryModule, CartModule, HistoryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
