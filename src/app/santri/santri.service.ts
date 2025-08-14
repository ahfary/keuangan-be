import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeductSaldoDto } from './santri.dto';
import { ResponseSuccess } from 'src/interface/response.interface';
import BaseResponse from 'src/utils/response.utils';
import { InjectRepository } from '@nestjs/typeorm';
import { Santri } from '../entity/santri.entity';
import { DataSource, In, Repository } from 'typeorm';
import { Kartu } from '../entity/kartu_santri.entity';

@Injectable()
export class SantriService extends BaseResponse {
  constructor(
    // private prismaService: PrismaService,
    @InjectRepository(Santri) private readonly santri: Repository<Santri>,
    @InjectRepository(Kartu) private readonly kartu: Repository<Kartu>,
    private readonly dataSource: DataSource,
  ) {
    super();
  }

  async getAllSantri(): Promise<ResponseSuccess> {
    const santri = await this.santri.find({
      relations: ['kartu'],
    });
    return this.success('Success', santri);
  }

  async getSantriDetail(id: number) {
    const detail = await this.santri.findOne({
      where: {
        id: id,
      },
    });
    return this.success('Success', detail);
  }

  async createSantri(data: any): Promise<ResponseSuccess> {
    const santri = await this.santri.save(data);
    return this.success('Santri created successfully', santri);
  }

  async updateSantri(id: number, data: any) {
    const santri = await this.santri.findOne({
      where: {
        id: id,
      },
    });
    await this.santri.update(id, data);
    return this.success('Santri updated successfully', santri);
  }

  async updateBulk(ids: number[], data: any | any[]): Promise<ResponseSuccess> {
    if (!ids.length) {
      throw new HttpException('IDs must be provided in query', 400);
    }

    const existingSantri = await this.santri.findBy({ id: In(ids) });
    if (existingSantri.length !== ids.length) {
      throw new HttpException('Some Santri not found', 404);
    }

    let updated;

    // Kalau body array → tiap ID beda data
    if (Array.isArray(data)) {
      if (data.length !== ids.length) {
        throw new HttpException('IDs and data length mismatch', 400);
      }
      const payload = ids.map((id, index) => ({ id, ...data[index] }));
      updated = await this.santri.save(payload);
    }
    // Kalau body object → semua ID sama datanya
    else {
      await this.santri.update({ id: In(ids) }, data);
      updated = { ids, ...data };
    }

    return this.success('Bulk update successfully', updated);
  }

  async updateSantriAndKartu(
    santriId: number,
    santriData: Partial<Santri>,
    kartuData?: Partial<Kartu>,
  ): Promise<ResponseSuccess> {
    return this.dataSource.transaction(async (manager) => {
      // Ambil santri + relasi kartu
      const santriEntity = await manager.findOne(Santri, {
        where: { id: santriId },
        relations: ['kartu'],
      });

      if (!santriEntity) {
        throw new NotFoundException(
          `Santri dengan ID ${santriId} tidak ditemukan`,
        );
      }

      // Update data santri
      await manager.update(Santri, santriId, santriData);

      // Update atau tambah kartu kalau kartuData ada & nggak kosong
      if (kartuData && Object.keys(kartuData).length > 0) {
        if (santriEntity.kartu) {
          // Kalau sudah ada kartu → update
          await manager.update(Kartu, santriEntity.kartu.id, kartuData);
        } else {
          // Kalau belum ada kartu → bikin baru
          const newKartu = this.kartu.create({
            ...kartuData,
            santri: santriEntity,
          });
          await manager.save(Kartu, newKartu);
        }
      }

      // Ambil data terbaru untuk response
      const updatedSantri = await manager.findOne(Santri, {
        where: { id: santriId },
        relations: ['kartu'],
      });

      return this.success('Santri & kartu berhasil diupdate', updatedSantri);
    });
  }

  async deleteSantri(id: number) {
    const santri = await this.santri.findOne({
      where: {
        id: id,
      },
    });
    await this.santri.delete(id);
    return this.success('Santri deleted successfully', santri);
  }
}
