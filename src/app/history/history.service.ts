import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import BaseResponse from 'src/utils/response.utils';
import { Santri } from '../entity/santri.entity';
import { Items } from '../entity/items.entity';
import { History } from '../entity/history.entity';
import { HistoryItem } from '../entity/history_item.entity';
import { CheckoutDto } from './history.dto';
import { ResponseSuccess } from 'src/interface/response.interface';

@Injectable()
export class HistoryService extends BaseResponse {
  constructor(
    @InjectRepository(Santri)
    private readonly santriRepository: Repository<Santri>,
    @InjectRepository(Items)
    private readonly itemsRepository: Repository<Items>,
    @InjectRepository(History)
    private readonly historyRepository: Repository<History>,
  ) {
    super();
  }

  async getHistory(): Promise<ResponseSuccess> {
    const history = await this.historyRepository.find({
      relations: ['santri', 'items'],
    });
    return this.success('History retrieved successfully', history);
  }

  async checkout(dto: CheckoutDto) {
    const { santriId, items } = dto;

    const santri = await this.santriRepository.findOne({
      where: { id: santriId },
    });
    if (!santri)
      throw new NotFoundException(`Santri ID ${santriId} tidak ditemukan`);

    let totalAmount = 0;
    const itemDetails: any = [];

    // validasi stok + hitung total
    for (const i of items) {
      const item = await this.itemsRepository.findOne({
        where: { id: i.itemId },
      });
      if (!item)
        throw new NotFoundException(`Item ${i.itemId} tidak ditemukan`);
      if (item.jumlah < i.quantity) {
        throw new BadRequestException(`Stok '${item.nama}' tidak cukup`);
      }

      totalAmount += item.harga * i.quantity;
      itemDetails.push({ ...item, quantity: i.quantity });
    }

    if (santri.saldo < totalAmount) {
      throw new BadRequestException('Saldo santri tidak cukup.');
    }

    return await this.historyRepository.manager.transaction(async (manager) => {
      // kurangi saldo
      await manager.decrement(Santri, { id: santriId }, 'saldo', totalAmount);

      // kurangi stok item
      for (const d of itemDetails) {
        await manager.decrement(Items, { id: d.id }, 'jumlah', d.quantity);
      }

      // buat history
      const newHistory = manager.create(History, { santriId, totalAmount });
      await manager.save(newHistory);

      // buat history items
      const historyItems = itemDetails.map((d) =>
        manager.create(HistoryItem, {
          history: newHistory,
          itemId: d.id,
          itemName: d.nama,
          quantity: d.quantity,
          priceAtPurchase: d.harga,
        }),
      );
      await manager.save(historyItems);

      return this.success('Checkout berhasil', {
        history: newHistory,
        totalAmount,
        items: historyItems.map((h) => ({
          itemId: h.itemId,
          itemName: h.itemName,
          quantity: h.quantity,
          priceAtPurchase: h.priceAtPurchase,
          subtotal: h.priceAtPurchase * h.quantity,
        })),
      });
    });
  }

  async checkoutHutang(dto: CheckoutDto) {
  const { santriId, items } = dto;

  const santri = await this.santriRepository.findOne({
    where: { id: santriId },
  });
  if (!santri)
    throw new NotFoundException(`Santri ID ${santriId} tidak ditemukan`);

  let totalAmount = 0;
  const itemDetails: any = [];

  // validasi stok + hitung total
  for (const i of items) {
    const item = await this.itemsRepository.findOne({
      where: { id: i.itemId },
    });
    if (!item)
      throw new NotFoundException(`Item ${i.itemId} tidak ditemukan`);
    if (item.jumlah < i.quantity) {
      throw new BadRequestException(`Stok '${item.nama}' tidak cukup`);
    }

    totalAmount += item.harga * i.quantity;
    itemDetails.push({ ...item, quantity: i.quantity });
  }

  return await this.historyRepository.manager.transaction(async (manager) => {
    // 🔹 kalau saldo cukup → kurangi saldo
    if (santri.saldo >= totalAmount) {
      await manager.decrement(Santri, { id: santriId }, 'saldo', totalAmount);
    } else {
      // 🔹 kalau saldo ga cukup → masukin ke hutang
      await manager.increment(
        Santri,
        { id: santriId },
        'hutang',
        totalAmount,
      );
    }

    // 🔹 kurangi stok item
    for (const d of itemDetails) {
      await manager.decrement(Items, { id: d.id }, 'jumlah', d.quantity);
    }

    // 🔹 bikin history
    const newHistory = manager.create(History, {
      santriId,
      totalAmount,
      isDebt: santri.saldo < totalAmount, // flag biar tau ini hutang atau bukan
    });
    await manager.save(newHistory);

    // 🔹 bikin history items
    const historyItems = itemDetails.map((d) =>
      manager.create(HistoryItem, {
        history: newHistory,
        itemId: d.id,
        itemName: d.nama,
        quantity: d.quantity,
        priceAtPurchase: d.harga,
      }),
    );
    await manager.save(historyItems);

    return this.success(
      santri.saldo >= totalAmount
        ? 'Checkout berhasil'
        : 'Checkout berhasil (hutang dicatat)',
      {
        history: newHistory,
        totalAmount,
        items: historyItems.map((h) => ({
          itemId: h.itemId,
          itemName: h.itemName,
          quantity: h.quantity,
          priceAtPurchase: h.priceAtPurchase,
          subtotal: h.priceAtPurchase * h.quantity,
        })),
      },
    );
  });
}

}
