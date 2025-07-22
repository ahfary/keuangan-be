import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './app/prisma/prisma.module';
import { AuthModule } from './app/auth/auth.module';

@Global()
@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
