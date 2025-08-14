import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { KartuService } from './kartu.service';

@Controller('kartu')
export class KartuController {
  constructor(private readonly kartuService: KartuService) {}

  @Get()
  async getAllKartu(@Query('noKartu') nomor: string) {
    return this.kartuService.getKartu(nomor);
  }

  @Get(':id')
  async getKartuById(@Param('id', ParseIntPipe) id: number) {
    return this.kartuService.getKartuById(id);
  }

  @Post()
  async createKartu(@Body() data: any) {
    return this.kartuService.createKartu(data);
  }

  @Patch(':id')
  async updateKartu(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.kartuService.updateKartu(id, data);
  }

  @Delete(':id')
  async deleteKartu(@Param('id', ParseIntPipe) id: number) {
    return this.kartuService.deleteKartu(id);
  }
}
