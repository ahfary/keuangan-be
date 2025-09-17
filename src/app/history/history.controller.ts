import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { HistoryService } from './history.service';
import { CheckoutDto } from './history.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { status } from '../entity/history.entity';

// @UseGuards(JwtGuard)
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post('checkout')
  async checkout(@Body() dto: CheckoutDto) {
    return this.historyService.checkout(dto);
  }

  @Post('hutang')
  async checkoutHutang(@Body() dto: CheckoutDto) {
    return this.historyService.checkoutHutang(dto);
  }

  @Get()
  async getAll(
    @Query('sort') sort: 'asc' | 'desc',
    @Query('status') status: status
) {
    return this.historyService.getHistory(sort ?? "desc",status);
  }

  @Get('santri/:id')
  async getHistoryBySantriId(
    @Param('id', ParseIntPipe) santriId: number,
    @Query('sort') sort: 'asc' | 'desc' = 'desc',
    @Query('status') status?: status,
  ) {
    return this.historyService.getHistoryBySantriId(santriId, sort, status);
  }

  @Get(':id')
  async getHistoryById(@Param('id', ParseIntPipe) id: number) {
    return this.historyService.getHistoryById(id);
  }
}
