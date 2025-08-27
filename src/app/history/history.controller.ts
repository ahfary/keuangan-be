import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { HistoryService } from './history.service';
import { JwtGuard } from '../auth/jwt.guard';
import { CheckoutDto } from './history.dto';

// @UseGuards(JwtGuard)
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post('checkout')
  async checkout(@Body() dto: CheckoutDto) {
    return this.historyService.checkout(dto);
  }
}
