import { Module } from '@nestjs/common';
import { SantriService } from './santri.service';
import { SantriController } from './santri.controller';
import { PrismaService } from '../prisma/prisma.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Santri } from '../entity/santri.entity';
import { Kartu } from '../entity/kartu_santri.entity';
import { Parent } from '../entity/parent.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Santri, Kartu, Parent])],
  providers: [SantriService],
  controllers: [SantriController],
})
export class SantriModule {}
