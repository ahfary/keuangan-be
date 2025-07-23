import { Module } from '@nestjs/common';
import { SantriService } from './santri.service';
import { SantriController } from './santri.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [SantriService, PrismaService],
  controllers: [SantriController]
})
export class SantriModule {}
