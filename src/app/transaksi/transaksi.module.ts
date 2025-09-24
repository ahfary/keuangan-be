import { Module } from '@nestjs/common';
import { TransaksiController } from './transaksi.controller';
import { TransaksiService } from './transaksi.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Santri } from '../entity/santri.entity';
import { Kartu } from '../entity/kartu_santri.entity';
import { HistoryTransaksi } from '../entity/history_transaksi.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Santri, Kartu, HistoryTransaksi])],
  controllers: [TransaksiController],
  providers: [TransaksiService],
  exports : [TransaksiService],
})
export class TransaksiModule {}
