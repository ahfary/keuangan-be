import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { MidtransService } from './midtrans.service';

@Controller('midtrans')
export class MidtransController {
  constructor(private readonly midtransService: MidtransService) {}

  @Post('create-transaction')
  async createTopup(@Body() dto: { santriId: number; grossAmount: number }) {
    return this.midtransService.createTransaction(dto);
  }

  @Post('notification')
  async handleNotification(@Body() notification: any) {
    return this.midtransService.handleNotification(notification);
  }
}
