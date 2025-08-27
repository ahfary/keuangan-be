import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { HistoryService } from './history.service';
import { CheckoutDto } from './history.dto';
import { JwtGuard } from '../auth/jwt.guard';

// @UseGuards(JwtGuard)
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post('checkout')
  async checkout(@Body() dto: CheckoutDto) {
    return this.historyService.checkout(dto);
  }

  @Get()
  async getAll() {
    return this.historyService.getHistory();
  }
}
