import { Module } from '@nestjs/common';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';
import { PrismaService } from '../prisma/prisma.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { History } from '../entity/history.entity';
import { Santri } from '../entity/santri.entity';
import { Items } from '../entity/items.entity';
import { HistoryItem } from '../entity/history_item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([History, Santri, Items])],
  controllers: [HistoryController],
  providers: [HistoryService],
})
export class HistoryModule {}
