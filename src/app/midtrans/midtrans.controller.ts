import { Body, Controller, Post } from '@nestjs/common';
import { MidtransService } from './midtrans.service';
import { CreateTransactionDto } from './midtrans.dto';

@Controller('midtrans')
export class MidtransController {
    constructor(private readonly midtransService: MidtransService){}

    @Post('create-transaction')
    async createTransaction(@Body() dto: any) {
      return this.midtransService.createTransaction(dto);
    }

    @Post('notification')
    async handleNotification(@Body() notification: any) {
      return this.midtransService.handleNotification(notification);
    }
}
