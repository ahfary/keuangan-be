import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { PrismaService } from '../prisma/prisma.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from '../entity/cart.entity';
import { CartItem } from '../entity/cart_item.entity';
import { Items } from '../entity/items.entity';
import { Santri } from '../entity/santri.entity';

@Module({
  imports : [TypeOrmModule.forFeature([Cart,CartItem,Items,Santri])],
  controllers: [CartController],
  providers: [CartService]
})
export class CartModule {}
