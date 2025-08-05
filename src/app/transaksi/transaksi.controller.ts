import { Body, Controller, Param, Post } from '@nestjs/common';
import { TransaksiService } from './transaksi.service';

@Controller('transaksi')
export class TransaksiController {
    constructor(private readonly transaksiService: TransaksiService){}

    @Post('top-up/:id')
    async topUpSantri(@Param('id') id:number, @Body('jumlah') jumlah:number) {
        return await this.transaksiService.topUpSantri(id, jumlah);
    }

    @Post('deduct/:id')
    async deductSantri(@Param('id') id:number, @Body('jumlah') jumlah:number) {
        return await this.transaksiService.deductSantri(id, jumlah);
    }
}
