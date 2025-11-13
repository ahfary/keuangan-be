import { Body, Controller, Post } from '@nestjs/common';
import { WinpayService } from './winpay.service';
import { CreateVaDto } from './winpay.dto';

@Controller('payments/winpay')
export class WinpayController {
  constructor(private readonly winpay: WinpayService) {}

  /** Create Virtual Account (SNAP API) */
  @Post('va')
  async createVa(@Body() dto: CreateVaDto) {
    return this.winpay.sendCreateVa(dto);
  }
}
