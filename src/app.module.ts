import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './app/prisma/prisma.module';
import { AuthModule } from './app/auth/auth.module';
import { SantriModule } from './app/santri/santri.module';
import { ItemsModule } from './app/items/items.module';
import { CloudinaryModule } from './app/cloudinary/cloudinary.module';

@Global()
@Module({
  imports: [PrismaModule, AuthModule, SantriModule, ItemsModule, CloudinaryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
