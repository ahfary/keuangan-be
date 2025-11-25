import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { WinpayService } from './winpay.service';
import { WinpayController } from './winpay.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinpayHistory } from '../entity/winpay_history.entity';
import { Santri } from '../entity/santri.entity';
import { TransaksiModule } from '../transaksi/transaksi.module';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([WinpayHistory, Santri]), TransaksiModule],
  providers: [WinpayService],
  controllers: [WinpayController],
})
export class WinpayModule {}
