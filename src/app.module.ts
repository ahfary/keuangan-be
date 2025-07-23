import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './app/prisma/prisma.module';
import { AuthModule } from './app/auth/auth.module';
import { SantriModule } from './app/santri/santri.module';

@Global()
@Module({
  imports: [PrismaModule, AuthModule, SantriModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
