import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import BaseResponse from 'src/utils/response.utils';
import { Kartu } from '../entity/kartu_santri.entity';
import { Repository } from 'typeorm';
import { ResponseSuccess } from 'src/interface/response.interface';

@Injectable()
export class KartuService extends BaseResponse {
  constructor(
    @InjectRepository(Kartu) private readonly kartu: Repository<Kartu>,
  ) {
    super();
  }

  // async getKartuBySantriId(santriId: number): Promise<ResponseSuccess> {
  //   const kartu = await this.kartu
  //   .createQueryBuilder('kartu')
  //   .leftJoinAndSelect('kartu.santri', 'santri')
  //   .where('santri.id = :santriId', { santriId })
  //   .orderBy('kartu.createdAt', 'DESC')
  //   .getMany();

  //   return this.success('Berhasil mendapatkan kartu santri', kartu);
  // }
  async getKartu(nomor: string) {
    if (nomor) {
      const nokartu = await this.kartu.findOne({
        where: { nomorKartu: nomor },
        relations: ['santri'],
      });
      if (!nokartu) {
        throw new HttpException('Kartu tidak ditemukan', 404);
      }
      return this.success('Berhasil mendapatkan kartu santri', nokartu);
    } else {
      const kartu = await this.kartu.find({
        relations: ['santri'],
      });
      return this.success('Berhasil mendapatkan semua kartu santri', kartu);
    }
  }

  async geKartuByNoKartu(nomor: string): Promise<ResponseSuccess> {
    const kartu = await this.kartu.findOne({
      where: { nomorKartu: nomor },
    });
    return this.success('Berhasil mendapatkan semua kartu santri', kartu);
  }

  async getKartuById(id: number): Promise<ResponseSuccess> {
    const kartu = await this.kartu.findOne({
      where: { id },
    });
    return this.success('Berhasil mendapatkan kartu santri', kartu);
  }

  async createKartu(data?:any)  : Promise<ResponseSuccess> {
    const kartu = await this.kartu.save(data);
    return this.success('Kartu santri berhasil dibuat', kartu);
  }

  async updateKartu(id: number, data: any): Promise<ResponseSuccess> {
    const kartu = await this.kartu.findOne({
      where: { id },
    });
    await this.kartu.update(id, data);
    return this.success('Kartu santri berhasil diupdate', kartu);
  }

  async deleteKartu(id: number): Promise<ResponseSuccess> {
    const kartu = await this.kartu.findOne({
      where: { id },
    });
    await this.kartu.delete(id);
    return this.success('Kartu santri berhasil dihapus', kartu);
  }
}
