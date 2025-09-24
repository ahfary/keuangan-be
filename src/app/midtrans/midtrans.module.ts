import { Module } from '@nestjs/common';
import { MidtransController } from './midtrans.controller';
import { MidtransService } from './midtrans.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Santri } from '../entity/santri.entity';
import { TransactionHistory } from '../entity/history_midtrans.entity';
import { TransaksiModule } from '../transaksi/transaksi.module';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionHistory, Santri]), TransaksiModule],
  controllers: [MidtransController],
  providers: [MidtransService]
})
export class MidtransModule {}
