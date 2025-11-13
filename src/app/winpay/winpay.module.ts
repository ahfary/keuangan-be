import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { WinpayService } from './winpay.service';
import { WinpayController } from './winpay.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), HttpModule],
  providers: [WinpayService],
  controllers: [WinpayController],
})
export class WinpayModule {}
