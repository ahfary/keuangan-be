import { Body, Controller, Post } from '@nestjs/common';
import { WinpayService } from './winpay.service';
import { CreateVaDto, InquiryStatus, InquiryVaDto } from './winpay.dto';

@Controller('payments/winpay')
export class WinpayController {
  constructor(private readonly winpay: WinpayService) {}

  /** Create Virtual Account (SNAP API) */
  @Post('va')
  async createVa(@Body() dto: CreateVaDto) {
    return this.winpay.sendCreateVa(dto);
  }

  @Post('va/inquiry')
  async inquiryVa(@Body() dto: InquiryVaDto) {
    return this.winpay.inquiryVa(dto);
  }

  @Post('callback')
  async callback(@Body() dto: any) {
    return this.winpay.callback(dto);
  }

  @Post('va/inquiry-status')
  async inquiryStatus(@Body() dto: InquiryStatus) {
    return this.winpay.inquiryVaStatus(dto);
  }
}
