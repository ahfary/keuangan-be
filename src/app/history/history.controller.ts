import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { HistoryService } from './history.service';
import { CheckoutDto } from './history.dto';

@Controller('history')
export class HistoryController {
    constructor(private readonly historyService: HistoryService){}

    @Get(':santriId')
    async getHistoryForSantri(@Param('santriId', ParseIntPipe) santriId: number) {
        return this.historyService.getHistoryForSantri(santriId);
    }

    @Post('checkout')
    async checkout(@Body() dto:CheckoutDto){
        return this.historyService.checkout(dto);
    }
}
