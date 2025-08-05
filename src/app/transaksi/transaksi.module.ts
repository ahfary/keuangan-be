import { Module } from '@nestjs/common';
import { TransaksiController } from './transaksi.controller';
import { TransaksiService } from './transaksi.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Santri } from '../entity/santri.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Santri])],
  controllers: [TransaksiController],
  providers: [TransaksiService]
})
export class TransaksiModule {}
