import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { KartuService } from './kartu.service';
import { CreateKartuDto, UpdateKartuDto } from './kartu.dto';

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

  @Post('create')
  @UsePipes(ValidationPipe)
  async createKartu(@Body() data: CreateKartuDto) {
    return this.kartuService.createKartu(data);
  }

  @Post('verify')
  async verifyKartu(@Body() data: any) {
    return this.kartuService.verifyKartu(data);
  }

  @Put(':id')
  @UsePipes(ValidationPipe)
  async updateKartu(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateKartuDto) {
    return this.kartuService.updateKartu(id, data);
  }

  @Delete(':id')
  async deleteKartu(@Param('id', ParseIntPipe) id: number) {
    return this.kartuService.deleteKartu(id);
  }
}
