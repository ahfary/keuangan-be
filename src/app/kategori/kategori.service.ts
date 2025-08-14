import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import BaseResponse from 'src/utils/response.utils';
import { Kategori } from '../entity/kategori.entity';
import { Repository } from 'typeorm';
import { ResponseSuccess } from 'src/interface/response.interface';

@Injectable()
export class KategoriService extends BaseResponse {
  constructor(
    @InjectRepository(Kategori) private readonly kategori: Repository<Kategori>,
  ) {
    super();
  }

  async getAllKategori(): Promise<ResponseSuccess> {
    const kategoris = await this.kategori.find();
    return this.success('Success', kategoris);
  }

  async getKategoriDetail(id: number): Promise<ResponseSuccess> {
    const detail = await this.kategori.findOne({
      where: { id: id },
    });
    return this.success('Success', detail);
  }

  async createKategori(data: any): Promise<ResponseSuccess> {
    const kategori = await this.kategori.save(data);
    return this.success('Kategori created successfully', kategori);
  }

  async updateKategori(id: number, data: any): Promise<ResponseSuccess> {
    const kategori = await this.kategori.findOne({
      where: { id: id },
    });
    await this.kategori.update(id, data);
    return this.success('Kategori updated successfully', kategori);
  }

  async deleteKategori(id: number): Promise<ResponseSuccess> {
    const kategori = await this.kategori.findOne({
      where: { id: id },
    });
    await this.kategori.delete(id);
    return this.success('Kategori deleted successfully', kategori);
  }
}
