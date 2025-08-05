import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import BaseResponse from 'src/utils/response.utils';
import { CheckoutDto } from './history.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { History } from '../entity/history.entity';
import { Cart } from '../entity/cart.entity';
import { Santri } from '../entity/santri.entity';
import { Items } from '../entity/items.entity';
import { CartItem } from '../entity/cart_item.entity';
import { HistoryItem } from '../entity/history_item.entity';

@Injectable()
export class HistoryService extends BaseResponse {
  constructor(
    @InjectRepository(History) private readonly historyRepository: Repository<History>,
    @InjectRepository(Cart) private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem) private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Santri) private readonly santriRepository: Repository<Santri>,
    @InjectRepository(Items) private readonly itemsRepository: Repository<Items>,
    @InjectRepository(HistoryItem) private readonly historyItemRepository: Repository<HistoryItem>,
  ) {
    super();
  }

  async getHistoryForSantri(santriId: number) {
    return this.historyRepository.find({
      where: { santriId },
      relations: ['items', 'items.item'],
      order: { createdAt: 'DESC' },
    });
  }

  async checkout(dto: CheckoutDto) {
    const { santriId } = dto;

    const cart = await this.cartRepository.findOne({
      where: { santriId },
      relations: ['cartItems', 'cartItems.item'],
    });

    const santri = await this.santriRepository.findOne({ where: { id: santriId } });

    if (!santri) throw new NotFoundException(`Santri dengan ID ${santriId} tidak ditemukan.`);
    if (!cart || cart.cartItems.length === 0)
      throw new BadRequestException('Keranjang kosong, tidak bisa checkout.');

    let totalAmount = 0;
    for (const cartItem of cart.cartItems) {
      if (cartItem.item.jumlah < cartItem.quantity) {
        throw new BadRequestException(`Stok untuk item '${cartItem.item.nama}' tidak mencukupi.`);
      }
      totalAmount += cartItem.item.harga * cartItem.quantity;
    }

    if (santri.saldo < totalAmount) {
      throw new BadRequestException(
        `Saldo santri (Rp ${santri.saldo}) tidak cukup untuk total belanja (Rp ${totalAmount}).`,
      );
    }

    return await this.historyRepository.manager.transaction(async (manager) => {
      // Kurangi saldo santri
      await manager.update(Santri, santriId, { saldo: santri.saldo - totalAmount });

      // Kurangi stok barang
      for (const cartItem of cart.cartItems) {
        await manager.update(Items, cartItem.item.id, {
          jumlah: cartItem.item.jumlah - cartItem.quantity,
        });
      }

      // Buat record History
      const newHistory = manager.create(History, {
        santriId,
        totalAmount,
      });
      await manager.save(newHistory);

      // Simpan HistoryItem
      const historyItems = cart.cartItems.map((ci) =>
        manager.create(HistoryItem, {
          history: newHistory,
          item: ci.item,
          quantity: ci.quantity,
          priceAtPurchase: ci.item.harga,
        }),
      );
      await manager.save(HistoryItem, historyItems);

      // Kosongkan CartItem
      await manager.delete(CartItem, { cart: { id: cart.id } });

      return newHistory;
    });
  }
}
