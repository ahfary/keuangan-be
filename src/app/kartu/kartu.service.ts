import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import BaseResponse from 'src/utils/response.utils';
import { Kartu } from '../entity/kartu_santri.entity';
import { Repository } from 'typeorm';
import { ResponseSuccess } from 'src/interface/response.interface';
import { compare, hash } from 'bcrypt';
import { CreateKartuDto, UpdateKartuDto } from './kartu.dto';

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

  async createKartu(data: CreateKartuDto): Promise<ResponseSuccess> {
    const kartuExists = await this.kartu.findOne({
      where: { nomorKartu: data.nomorKartu },
    });
    if (kartuExists) {
      throw new HttpException('Kartu dengan nomor ini sudah ada', 400);
    }
    data.passcode = await hash(data.passcode, 12);
    const kartu = await this.kartu.save(data);
    return this.success('Kartu santri berhasil dibuat', kartu);
  }

  async verifyKartu(data:any): Promise<ResponseSuccess> {
    const kartu = await this.kartu.findOne({
      where: { nomorKartu : data.nomorKartu },
    });

    if (!kartu) {
      throw new HttpException('Kartu tidak ditemukan', 404);
    }

    const isMatch = await compare(data.passcode, kartu.passcode);
    if (!isMatch) {
      throw new HttpException('Passcode salah', 401);
    }

    return this.success('Verifikasi berhasil', {
      id: kartu.id,
      nomorKartu: kartu.nomorKartu,
    });
  }

  async updateKartu(id: number, data: UpdateKartuDto): Promise<ResponseSuccess> {
    const kartu = await this.kartu.findOne({
      where: { id },
    });
    if (!kartu) {
      throw new HttpException('Kartu tidak ditemukan', 404);
    }
    data.passcode = await hash(data.passcode, 12);
    const updatedKartu = await this.kartu.update(id, data);
    return this.success('Kartu santri berhasil diupdate', updatedKartu);
  }

  async deleteKartu(id: number): Promise<ResponseSuccess> {
    const kartu = await this.kartu.findOne({
      where: { id },
    });
    await this.kartu.delete(id);
    return this.success('Kartu santri berhasil dihapus', kartu);
  }
}
