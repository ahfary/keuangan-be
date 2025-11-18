import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeductSaldoDto, UpdateSantriDto } from './santri.dto';
import { ResponseSuccess } from 'src/interface/response.interface';
import BaseResponse from 'src/utils/response.utils';
import { InjectRepository } from '@nestjs/typeorm';
import { Santri } from '../entity/santri.entity';
import { DataSource, In, Repository } from 'typeorm';
import { Kartu } from '../entity/kartu_santri.entity';
import { Parent } from '../entity/parent.entity';
import { role } from '../entity/user.entity';
import axios from 'axios';
import { History } from '../entity/history.entity';

@Injectable()
export class SantriService extends BaseResponse {
  constructor(
    // private prismaService: PrismaService,
    @InjectRepository(Santri) private readonly santri: Repository<Santri>,
    @InjectRepository(Kartu) private readonly kartu: Repository<Kartu>,
    @InjectRepository(Parent) private readonly parent: Repository<Parent>,
    @InjectRepository(History) private readonly history: Repository<History>,
    private readonly dataSource: DataSource,
  ) {
    super();
  }

  async getAllSantri(): Promise<ResponseSuccess> {
    const santri = await this.santri.find({
      relations: ['kartu', 'parent'],
      select: {
        parent: {
          id: true,
        },
      },
    });
    return this.success('Success', santri);
  }
  async countSantri(): Promise<ResponseSuccess> {
    const countSantri = await this.santri.count();
    return this.success('Success', countSantri);
  }

  async findAllWalsan(): Promise<ResponseSuccess> {
    const parents = await this.parent.find({
      relations: ['user', 'santri'],
    });

    if (!parents || parents.length === 0) {
      return this.success('Data walsan kosong', []);
    }

    const walsanParents = parents.filter(
      (p) => p.user && p.user.role === role.WALISANTRI,
    );

    const responseData = walsanParents
      .map((parent) => {
        if (!parent.user) return null;

        // buang password dengan destructuring
        const { password, ...safeUser } = parent.user;

        return {
          id: safeUser.id,
          email: safeUser.email,
          name: safeUser.name,
          parent: {
            id: parent.id,
            name: parent.name,
            santri: parent.santri,
          },
        };
      })
      .filter(Boolean); // filter null kalau ada parent.user yang undefined

    return this.success('Berhasil mengambil semua data walsan', responseData);
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

  async updateSantri(id: number, data: UpdateSantriDto) {
    const santri = await this.santri.findOne({
      where: {
        id: id,
      },
    });

    if (!santri) {
      throw new NotFoundException('Santri not found');
    }
    const update = await this.santri.update(id, data);
    return this.success('Santri updated successfully', update);
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

  // async deleteBulk(array: number[]): Promise<ResponseSuccess> {
  //   if (!array.length) {
  //     throw new HttpException('array must be provided in query', 400);
  //   }

  //   const existingSantri = await this.santri.findBy({ id: In(array) });
  //   if (existingSantri.length !== array.length) {
  //     throw new HttpException('Some Santri not found', 404);
  //   }

  //   await this.santri.delete(array);
  //   return this.success('Bulk delete successfully', array);
  // }
  async deleteBulk(array: number[]): Promise<ResponseSuccess> {
    const deleted = await this.santri.delete(array);

    if (deleted.affected == 0) {
      throw new HttpException('Santri Tidak Ditemukan', 404);
    }
    return this.success('Bulk delete successfully', deleted);
  }

  async deleteBulkWalsan(array: number[]): Promise<ResponseSuccess> {
    const deleted = await this.parent.delete(array);

    if (deleted.affected == 0) {
      throw new HttpException('Santri Tidak Ditemukan', 404);
    }
    return this.success('Bulk delete successfully', deleted);
  }

  async getSaldoById(id: any): Promise<ResponseSuccess> {
    const saldo = await this.santri.findOne({
      where: id,
      select: ['id', 'saldo', 'hutang', 'name'],
    });
    return this.success('Success', saldo);
  }

  async totalSaldoSantri(): Promise<ResponseSuccess> {
    const result = await this.santri
      .createQueryBuilder('santri')
      .select('SUM(santri.saldo)', 'totalSaldo')
      .getRawOne<{ totalSaldo: string }>();

    const totalSaldo = parseInt(result?.totalSaldo ?? '0', 10);

    if (totalSaldo === 0) {
      throw new NotFoundException('Tidak ada saldo santri yang ditemukan.');
    }

    return this.success(
      'Total saldo semua santri berhasil dihitung.',
      totalSaldo,
    );
  }

  async totalHutangSantri(): Promise<ResponseSuccess> {
    const result = await this.santri
      .createQueryBuilder('santri')
      .select('SUM(santri.hutang)', 'totalHutang')
      .getRawOne<{ totalHutang: string }>();

    const totalHutang = parseInt(result?.totalHutang ?? '0', 10);

    if (totalHutang === 0) {
      throw new NotFoundException('Tidak ada hutang santri yang ditemukan.');
    }

    return this.success(
      'Total hutang semua santri berhasil dihitung.',
      totalHutang,
    );
  }

  async saldoTerbanyakSantri(): Promise<ResponseSuccess> {
    const santri = await this.santri.find({
      order: { saldo: 'DESC' },
    });

    if (!santri) {
      throw new NotFoundException('Tidak ada santri yang ditemukan.');
    }

    return this.success(
      'Santri dengan saldo terbesar berhasil ditemukan.',
      santri,
    );
  }
  // async profileSantri(id: number): Promise<ResponseSuccess> {
  //   // cek santri
  //   const santri = await this.santri.findOne({ where: { id } });
  //   if (!santri)
  //     throw new NotFoundException(`Santri dengan ID ${id} tidak ditemukan.`);

  //   const raw = await this.history
  //     .createQueryBuilder('history')
  //     .select(
  //       `
  //     COALESCE(
  //       SUM(
  //         CASE
  //           WHEN history.status = :lunas THEN history.totalAmount
  //           ELSE 0
  //         END
  //       ), 0
  //     )`,
  //       'saldo',
  //     )
  //     .addSelect(
  //       `
  //     COALESCE(
  //       SUM(
  //         CASE
  //           WHEN history.status = :hutang THEN history.totalAmount
  //           ELSE 0
  //         END
  //       ), 0
  //     )`,
  //       'hutang',
  //     )
  //     .addSelect('COUNT(history.id)', 'jumlahTransaksi')
  //     .where('history.santriId = :id', { id })
  //     .setParameters({
  //       lunas: 'LUNAS',
  //       hutang: 'HUTANG',
  //     })
  //     .getRawOne<{
  //       saldo: string;
  //       hutang: string;
  //       jumlahTransaksi: string;
  //     }>();

  //   const result = {
  //     saldo: Number(raw?.saldo ?? 0),
  //     jumlahTransaksi: Number(raw?.jumlahTransaksi ?? 0),
  //     hutang: Number(raw?.hutang ?? 0),
  //   };

  //   return this.success(
  //     `Summary keuangan santri dengan ID ${id} berhasil dihitung.`,
  //     result,
  //   );
  // }

  async profileSantri(id: number): Promise<ResponseSuccess> {
    // Ambil data santri
    const santri = await this.santri.findOne({
      where: { id },
      select: ['id', 'saldo', 'hutang'],
    });

    if (!santri) {
      throw new NotFoundException(`Santri dengan ID ${id} tidak ditemukan.`);
    }

    const totalTransaksi = await this.history.count({
      where: { santriId: id },
    });

    const result = {
      ...santri,
      totalTransaksi,
    };

    return this.success(
      `Profile santri dengan ID ${id} berhasil diambil.`,
      result,
    );
  }

  async getTagihan(nisn: any) {
  return axios
    .get(`https://lap-uang-fawwaz.vercel.app/payments/tagihan/${nisn}`)
    .then((res) => {
      return this.success('Berhasil mendapatkan tagihan santri', res.data);
    })
    .catch((err) => {
      return err
    });
}

}
