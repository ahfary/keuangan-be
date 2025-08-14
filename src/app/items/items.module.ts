import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { PrismaService } from '../prisma/prisma.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Items } from '../entity/items.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Items])],
  controllers: [ItemsController],
  providers: [ItemsService],
})
export class ItemsModule {}
