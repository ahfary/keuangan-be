import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import BaseResponse from 'src/utils/response.utils';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutDto } from './history.dto';

@Injectable()
export class HistoryService extends BaseResponse {
  constructor(private prismaService: PrismaService) {
    super();
  }

  getHistoryForSantri(santriId: number) {
    return this.prismaService.history.findMany({
      where: { santriId },
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async checkout(dto: CheckoutDto) {
    const { santriId } = dto;

    // 1. Ambil data cart dan santri
    const cart = await this.prismaService.cart.findFirst({
      where: { santriId },
      include: {
        CartItem: {
          include: {
            item: true,
          },
        },
      },
    });

    const santri = await this.prismaService.santri.findUnique({
      where: { id: santriId },
    });

    if (!santri) throw new NotFoundException(`Santri dengan ID ${santriId} tidak ditemukan.`);
    if (!cart || cart.CartItem.length === 0)
      throw new BadRequestException('Keranjang kosong, tidak bisa checkout.');

    // 2. Kalkulasi total harga + validasi stok
    let totalAmount = 0;
    for (const cartItem of cart.CartItem) {
      if (cartItem.item.jumlah < cartItem.quantity) {
        throw new BadRequestException(
          `Stok untuk item '${cartItem.item.nama}' tidak mencukupi.`,
        );
      }
      totalAmount += cartItem.item.harga * cartItem.quantity;
    }

    // 3. Validasi saldo
    if (santri.saldo < totalAmount) {
      throw new BadRequestException(
        `Saldo santri (Rp ${santri.saldo}) tidak cukup untuk total belanja (Rp ${totalAmount}).`,
      );
    }

    // 4. Transaksi atomik
    return this.prismaService.$transaction(async (tx) => {
      // a. Kurangi saldo santri
      await tx.santri.update({
        where: { id: santriId },
        data: { saldo: { decrement: totalAmount } },
      });

      // b. Kurangi stok barang
      for (const cartItem of cart.CartItem) {
        await tx.items.update({
          where: { id: cartItem.itemId },
          data: { jumlah: { decrement: cartItem.quantity } },
        });
      }

      // c. Buat record History
      const newHistory = await tx.history.create({
        data: {
          santriId,
          totalAmount,
        },
      });

      // d. Pindahkan semua item ke HistoryItem
      await tx.historyItem.createMany({
        data: cart.CartItem.map((ci) => ({
          historyId: newHistory.id,
          itemId: ci.itemId,
          quantity: ci.quantity,
          priceAtPurchase: ci.item.harga,
        })),
      });

      // e. Kosongkan CartItem tanpa hapus Cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newHistory;
    });
  }
}
