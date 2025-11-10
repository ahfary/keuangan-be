import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SantriService } from './santri.service';
import { JwtGuard } from '../auth/jwt.guard';
import { DeductSaldoDto, UpdateSantriDto } from './santri.dto';
import { Santri } from '../entity/santri.entity';
import { Kartu } from '../entity/kartu_santri.entity';

// @UseGuards(JwtGuard)
@Controller('santri')
export class SantriController {
  constructor(private readonly santriService: SantriService) {}

  @Get()
  async getAllSantri() {
    return this.santriService.getAllSantri();
  }

  @Get('walsan')
  async findAllWalsan() {
    return this.santriService.findAllWalsan();
  }

  @Get('count')
  async countSantri() {
    return this.santriService.countSantri();
  }

  @Get('detail/:id')
  async getSantriDetail(@Param('id', ParseIntPipe) id: number) {
    return this.santriService.getSantriDetail(id);
  }

  @Get('total-saldo')
  async getTotalSaldo() {
    return this.santriService.totalSaldoSantri();
  }

  @Get('saldo/:id')
  async getSaldoById(@Param('id', ParseIntPipe) id: number) {
    return this.santriService.getSaldoById(id);
  }

  @Get('saldo-max')
  async getSaldoTerbanyakSantri() {
    return this.santriService.saldoTerbanyakSantri();
  }

  @Get('hutang')
  async getTotalHutang() {
    return this.santriService.totalHutangSantri();
  }

  @Post('create')
  async createSantri(@Body() data: any) {
    return this.santriService.createSantri(data);
  }

  @Put('update/:id')
  async updateSantri(@Param('id', ParseIntPipe) id: number, @Body() data:UpdateSantriDto) {
    return this.santriService.updateSantri(id, data);
  }

  @Put('update-bulk')
  async updateBulk(@Query('id') ids: string, @Body() data: any | any[]) {
    const parsedIds = ids.split(',').map(Number);
    return this.santriService.updateBulk(parsedIds, data);
  }

  @Put('update-santri-kartu/:id')
  async updateSantriAndKartu(
    @Param('id') id: number,
    @Body() body: { santriData: Partial<Santri>; kartuData?: Partial<Kartu> },
  ) {
    return this.santriService.updateSantriAndKartu(
      id,
      body.santriData,
      body.kartuData,
    );
  }

  @Delete('delete/:id')
  async deleteSantri(@Param('id', ParseIntPipe) id: number) {
    return this.santriService.deleteSantri(id);
  }

  @Delete('delete-bulk')
  async deleteBulk(@Query('id') ids: string) {
    const parsedIds = ids.split(',').map(Number);
    return this.santriService.deleteBulk(parsedIds);
  }

  @Delete('delete-bulk-walsan')
  async deleteBulkWalsan(@Query('id') ids: string) {
    const parsedIds = ids.split(',').map(Number);
    return this.santriService.deleteBulkWalsan(parsedIds);
  }
}
