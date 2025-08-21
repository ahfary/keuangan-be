import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import BaseResponse from 'src/utils/response.utils';
import { CheckoutDto } from './history.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { History, status } from '../entity/history.entity';
import { Cart } from '../entity/cart.entity';
import { Santri } from '../entity/santri.entity';
import { Items } from '../entity/items.entity';
import { CartItem } from '../entity/cart_item.entity';
import { HistoryItem } from '../entity/history_item.entity';
import { ResponseSuccess } from 'src/interface/response.interface';

@Injectable()
export class HistoryService extends BaseResponse {
  constructor(
    @InjectRepository(History)
    private readonly historyRepository: Repository<History>,
    @InjectRepository(Cart) private readonly cartRepository: Repository<Cart>,
  ) {
    super();
  }

  async getHistoryForSantri(santriId: number) {
    const history = await this.historyRepository.find({
      where: { santriId },
      relations: ['items', 'items.item'],
      order: { createdAt: 'DESC' },
    });
    if (!history || history.length === 0)
      throw new NotFoundException('History tidak ditemukan.');
    return this.success('History berhasil ditemukan.', history);
  }

  async getHistory(status?: status, kelas?: string): Promise<ResponseSuccess> {
    const whereCondition: any = {};

    // filter status kalau dikasih
    if (status) {
      whereCondition.status = status;
    }

    // filter kelas (nested ke Santri)
    if (kelas) {
      whereCondition.santri = { kelas };
    }

    const histories = await this.historyRepository.find({
      where: whereCondition,
      relations: ['santri', 'items', 'items.item'],
      order: { createdAt: 'DESC' },
    });

    if (!histories || histories.length === 0) {
      throw new NotFoundException(
        status && kelas
          ? `History dengan status ${status} dan kelas ${kelas} tidak ditemukan.`
          : status
            ? `History dengan status ${status} tidak ditemukan.`
            : kelas
              ? `History untuk kelas ${kelas} tidak ditemukan.`
              : 'History tidak ditemukan.',
      );
    }

    return this.success('History berhasil ditemukan.', histories);
  }

  async countHistory(status?: status): Promise<ResponseSuccess> {
    let count: number;

    if (status) {
      count = await this.historyRepository.count({ where: { status } });
    } else {
      count = await this.historyRepository.count();
    }

    if (count === 0) {
      throw new NotFoundException(
        status
          ? `Tidak ada history dengan status ${status}.`
          : 'History tidak ditemukan.',
      );
    }

    return this.success(
      status
        ? `Jumlah history dengan status ${status} berhasil dihitung.`
        : 'Jumlah semua history berhasil dihitung.',
      count,
    );
  }

  async checkout(dto: CheckoutDto) {
    const { santriId } = dto;

    // Langkah 1: Ambil data cart beserta semua relasi yang dibutuhkan dalam SATU query
    const cart = await this.cartRepository.findOne({
      where: { santriId },
      // PERBAIKAN: Gunakan 'cartItems.item' (singular) agar cocok dengan 'cartItem.item'
      relations: ['cartItems', 'cartItems.item', 'santri'],
    });

    // Langkah 2: Pengecekan awal yang lebih robust (Guard Clause)
    if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
      throw new BadRequestException('Keranjang tidak ditemukan atau kosong.');
    }

    // Data santri diambil dari relasi, tidak perlu query lagi. Ini lebih efisien.
    const santri = cart.santri;
    if (!santri) {
      // Pengecekan ini untuk keamanan, seandainya relasi tidak ter-setup dengan baik
      throw new NotFoundException(
        `Data santri untuk keranjang ini tidak ditemukan.`,
      );
    }

    // Langkah 3: Kalkulasi total dan validasi stok (logika Anda sudah benar)
    let totalAmount = 0;
    for (const cartItem of cart.cartItems) {
      if (!cartItem.item) {
        // Pengecekan tambahan jika karena suatu hal item di keranjang tidak ada lagi di database
        throw new NotFoundException(
          `Item dengan ID ${cartItem.itemId} di keranjang tidak ditemukan.`,
        );
      }
      if (cartItem.item.jumlah < cartItem.quantity) {
        throw new BadRequestException(
          `Stok untuk item '${cartItem.item.nama}' tidak mencukupi.`,
        );
      }
      totalAmount += cartItem.item.harga * cartItem.quantity;
    }

    // Validasi saldo
    if (santri.saldo < totalAmount) {
      throw new BadRequestException(
        `Saldo santri (Rp ${santri.saldo}) tidak cukup untuk total belanja (Rp ${totalAmount}).`,
      );
    }

    // Langkah 4: Jalankan semua operasi database dalam satu transaksi
    return await this.historyRepository.manager.transaction(async (manager) => {
      // Kurangi saldo santri
      await manager.decrement(Santri, { id: santriId }, 'saldo', totalAmount);

      // Kurangi stok barang
      for (const cartItem of cart.cartItems) {
        await manager.decrement(
          Items,
          { id: cartItem.item.id },
          'jumlah',
          cartItem.quantity,
        );
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
          itemId: ci.item.id,
          itemName: ci.item.nama, // Simpan juga nama dan harga saat itu
          quantity: ci.quantity,
          priceAtPurchase: ci.item.harga,
        }),
      );
      await manager.save(historyItems);

      // Kosongkan CartItem yang terasosiasi dengan cart ini
      await manager.delete(CartItem, { cart: { id: cart.id } });

      return this.success('Checkout berhasil', newHistory);
    });
  }
}
