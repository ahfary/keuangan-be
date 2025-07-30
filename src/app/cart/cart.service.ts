import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import BaseResponse from 'src/utils/response.utils';
import { PrismaService } from '../prisma/prisma.service';
import { ResponseSuccess } from 'src/interface/response.interface';
import { AddToCartDto } from './cart.dto';

@Injectable()
export class CartService extends BaseResponse {
  constructor(private prismaService: PrismaService) {
    super();
  }

  async addToCart(dto: AddToCartDto) {
    const { santriId, itemId, quantity } = dto;

    // 1. Validasi keberadaan santri dan item
    const item = await this.prismaService.items.findUnique({ where: { id: itemId } });
    if (!item) {
      throw new NotFoundException(`Item dengan ID ${itemId} tidak ditemukan.`);
    }
    const santri = await this.prismaService.santri.findUnique({ where: { id: santriId } });
    if (!santri) {
      throw new NotFoundException(`Santri dengan ID ${santriId} tidak ditemukan.`);
    }

    // 2. Cari keranjang (wadah) milik santri, atau buat jika belum ada.
    let cart = await this.prismaService.cart.findFirst({
      where: { santriId },
    });

    if (!cart) {
      cart = await this.prismaService.cart.create({
        data: { santriId, itemId },
      });
    }

    // 3. Cek apakah item sudah ada di dalam keranjang (CartItem).
    const existingCartItem = await this.prismaService.cartItem.findFirst({
      where: {
        cartId: cart.id,
        itemId: itemId,
      },
    });

    if (existingCartItem) {
      // Jika sudah ada, update quantity-nya.
      return this.prismaService.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: { increment: quantity } },
      });
    } else {
      // Jika belum ada, buat record CartItem baru.
      return this.prismaService.cartItem.create({
        data: {
          cartId: cart.id,
          itemId,
          quantity,
        },
      });
    }
  }

  async getCart(santriId: number) {
    const cart = await this.prismaService.cart.findFirst({
      where: { santriId },
      include: {
        CartItem: {
            include : {
                item : true
            }
        }
        // items: { // Ini adalah relasi ke CartItem
        //   orderBy: { id: 'asc' },
        //   include: {
        //     item: true, // Sertakan juga detail dari model Item
        //   },
        // },
      },
    });

    if (!cart) {
      throw new NotFoundException(`Keranjang untuk Santri ID ${santriId} tidak ditemukan.`);
    }
    return cart;
  }
  
  async removeItemFromCart(cartItemId: number):Promise<ResponseSuccess> {
    const deleted = await this.prismaService.cartItem.delete({
      where: { id: cartItemId },
    })
    if(deleted == null) throw new HttpException('Item di keranjang dengan ID tersebut tidak ditemukan.', 404);
    return this.success('Item di keranjang berhasil dihapus.', deleted);
    
  }
}
