import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import BaseResponse from 'src/utils/response.utils';
import { Santri } from '../entity/santri.entity';
import { Repository } from 'typeorm';
import { Kartu } from '../entity/kartu_santri.entity';
import { ResponseSuccess } from 'src/interface/response.interface';

@Injectable()
export class TransaksiService extends BaseResponse {
  constructor(
    @InjectRepository(Santri) private readonly santri: Repository<Santri>,
    @InjectRepository(Kartu) private readonly kartu: Repository<Kartu>,
  ) {
    super();
  }

  // async topUpSantri(id: number, jumlah: number) {
  //   const santri = await this.santri.findOne({
  //     where: {
  //       id: id,
  //     },
  //   });

  //   if (!santri) {
  //     throw new HttpException('Santri tidak ditemukan', 404);
  //   }
  //   if (santri.hutang > 0) {
  //     if (jumlah >= santri.hutang) {
  //       const sisa = jumlah - santri.hutang;
  //       santri.hutang = 0;
  //       santri.saldo += sisa;
  //     } else {
  //       santri.hutang -= jumlah;
  //     }
  //   } else {
  //     santri.saldo += jumlah;
  //   }
  //   const newSaldo = santri.saldo + jumlah;
  //   const update = await this.santri.update(id, { saldo: newSaldo });
  //   return this.success('Saldo berhasil ditambahkan', update);
  // }
  async topUpSantri(id: number, jumlah: number) {
    const santri = await this.santri.findOne({
      where: { id },
      select: {
        id: true,
        saldo: true,
        hutang: true,
      },
    });
    if (!santri) throw new HttpException('Santri tidak ditemukan', 404);

    if (santri.hutang > 0) {
      if (jumlah >= santri.hutang) {
        const sisa = jumlah - santri.hutang;
        santri.hutang = 0;
        santri.saldo += sisa;
      } else {
        santri.hutang -= jumlah;
      }
    } else {
      santri.saldo += jumlah;
    }
    await this.santri.save(santri);
    return this.success('Top up berhasil', santri);
  }

  async deductSantri(id: number, jumlah: number) {
    const santri = await this.santri.findOne({
      where: {
        id: id,
      },
    });
    if (!santri) {
      throw new HttpException('Santri tidak ditemukan', 404);
    }
    if (santri.saldo < jumlah) {
      throw new HttpException('Saldo tidak mencukupi', 400);
    }
    if (santri.hutang > 0) {
      if (jumlah >= santri.hutang) {
        const sisa = jumlah - santri.hutang;
        santri.hutang = 0;
        santri.saldo += sisa;
      } else {
        santri.hutang -= jumlah;
      }
    } else {
      santri.saldo += jumlah;
    }
    const newSaldo = santri.saldo - jumlah;
    const update = await this.santri.update(id, { saldo: newSaldo });
    return this.success('Saldo berhasil dikurangi', update);
  }

  async hutangSantri(id: number, jumlah: number) {
    const santri = await this.santri.findOne({
      where: {
        id: id,
      },
    });
    if (!santri) {
      throw new HttpException('Santri tidak ditemukan', 404);
    }
    const newHutang = santri.hutang + jumlah;
    const update = await this.santri.update(id, { hutang: newHutang });
    return this.success('Berhasil menggunakan hutang', update);
  }

  // KARTU SANTRI
  async getAllKartuSantri(): Promise<ResponseSuccess> {
    const kartuSantri = await this.kartu.find();
    return this.success('Berhasil mendapatkan semua kartu santri', kartuSantri);
  }

  async getKartuSantriById(id: number): Promise<ResponseSuccess> {
    const kartuSantri = await this.kartu.findOne({
      where: { id },
    });
    return this.success('Berhasil mendapatkan kartu santri', kartuSantri);
  }
}
