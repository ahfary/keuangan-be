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

  async topUpSantri(id: number, jumlah: number) {
    const santri = await this.santri.findOne({
      where: {
        id: id,
      },
    });
    if (!santri) {
      throw new HttpException('Santri tidak ditemukan', 404);
    }
    const newSaldo = santri.saldo + jumlah;
    const update = await this.santri.update(id, { saldo: newSaldo });
    return this.success('Saldo berhasil ditambahkan', update);
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
    const newSaldo = santri.saldo - jumlah;
    const update = await this.santri.update(id, { saldo: newSaldo });
    return this.success('Saldo berhasil dikurangi', update);
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
