import { Module } from '@nestjs/common';
import { TransaksiController } from './transaksi.controller';
import { TransaksiService } from './transaksi.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Santri } from '../entity/santri.entity';
import { Kartu } from '../entity/kartu_santri.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Santri, Kartu])],
  controllers: [TransaksiController],
  providers: [TransaksiService],
})
export class TransaksiModule {}
