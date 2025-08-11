import { HttpException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import BaseResponse from 'src/utils/response.utils';
import { PrismaService } from '../prisma/prisma.service';
import { ResponseSuccess } from 'src/interface/response.interface';
import { AddToCartDto } from './cart.dto';
import { Cart } from '../entity/cart.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from '../entity/cart_item.entity';
import { Items } from '../entity/items.entity';
import { Santri } from '../entity/santri.entity';

@Injectable()
export class CartService extends BaseResponse {
  constructor(
    @InjectRepository(Cart) private readonly cart: Repository<Cart>,
    @InjectRepository(CartItem) private readonly cartItem: Repository<CartItem>,
    @InjectRepository(Items) private readonly items: Repository<Items>,
    @InjectRepository(Santri) private readonly santri: Repository<Santri>,
  ) {
    super();
  }

  async addToCart(dto: AddToCartDto) {
    const { santriId, itemId, quantity } = dto;

    // 1. Validasi keberadaan santri dan item
    const item = await this.items.find({ where: { id: itemId } });
    if (!item) {
      throw new NotFoundException(`Item dengan ID ${itemId} tidak ditemukan.`);
    }
    const santri = await this.santri.findOne({ where: { id: santriId } });
    if (!santri) {
      throw new NotFoundException(`Santri dengan ID ${santriId} tidak ditemukan.`);
    }

    // 2. Cari keranjang (wadah) milik santri, atau buat jika belum ada.
    let cart = await this.cart.findOne({
      where: { santriId },
    });

    if (!cart) {
      cart = await this.cart.save(this.cart.create({ santriId }));
      // cart = await this.prismaService.cart.create({
      //   data: { santriId, itemId },
      // });
    }

    // 3. Cek apakah item sudah ada di dalam keranjang (CartItem).
    const existingCartItems = await this.cartItem.find({
      where: {
        cartId: cart.id,
        itemId: itemId,
      },
    });

    if (existingCartItems && existingCartItems.length > 0) {
      // Jika sudah ada, update quantity-nya.
      return this.cartItem.update(
        existingCartItems[0].id,
        { quantity: existingCartItems[0].quantity + quantity }
      );
    } else {
      // Jika belum ada, buat record CartItem baru.
      const newCartItem = this.cartItem.create({
        cartId: cart.id,
        itemId,
        quantity,
      });
      await this.cartItem.save(newCartItem);
      return this.success('Item berhasil ditambahkan ke keranjang.', newCartItem);
    }
  }

  async getCart(santriId: number) {
    // const cart = await this.cart.findOne({
    //   where: { santriId },
    //   relations: {
    //     cartItems: {
    //       item: true
    //     }
    //   }
    // });
    const cart = await this.cart.findOne({
      where: { santriId },
      relations: ['items', 'santri'],
    });

    if (!cart) {
      throw new NotFoundException(`Keranjang untuk Santri ID ${santriId} tidak ditemukan.`);
    }
    return this.success('Keranjang berhasil ditemukan.', cart);
  }
  
  async removeItemFromCart(cartItemId: number):Promise<ResponseSuccess> {
    // const deleted = await this.prismaService.cartItem.delete({
    //   where: { id: cartItemId },
    // })
    const deleted = await this.cartItem.findOneBy({id:cartItemId})
    await this.cartItem.delete(cartItemId);
    if(deleted == null) throw new HttpException('Item di keranjang dengan ID tersebut tidak ditemukan.', 404);
    return this.success('Item di keranjang berhasil dihapus.', deleted);
    
  }
}
