import { Global, Module } from '@nestjs/common';
import { WinpayController } from './winpay.controller';
import { WinpayService } from './winpay.service';

@Global()
@Module({
  imports: [],
  controllers: [WinpayController],
  providers: [WinpayService]
})
export class WinpayModule {}
