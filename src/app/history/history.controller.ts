import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { HistoryService } from './history.service';
import { CheckoutDto } from './history.dto';
import { ResponseSuccess } from 'src/interface/response.interface';
import { status } from '../entity/history.entity';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get('byid/:santriId')
  async getHistoryForSantri(@Param('santriId', ParseIntPipe) santriId: number) {
    return this.historyService.getHistoryForSantri(santriId);
  }

  @Post('checkout')
  async checkout(@Body() dto: CheckoutDto) {
    return this.historyService.checkout(dto);
  }

  @Get()
  async getHistory(
    @Query('status') status?: any,
    @Query('kelas') kelas?: string,
  ) {
    return this.historyService.getHistory(status, kelas);
  }

  @Get('count')
  async countHistory(@Query('status') status?: any) {
    return this.historyService.countHistory(status);
  }
}
