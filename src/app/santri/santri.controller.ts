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
import { DeductSaldoDto } from './santri.dto';
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

  @Get(':id')
  async getSantriDetail(@Param('id', ParseIntPipe) id: number) {
    return this.santriService.getSantriDetail(id);
  }

  @Post('create')
  async createSantri(@Body() data: any) {
    return this.santriService.createSantri(data);
  }

  @Put('update/:id')
  async updateSantri(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
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
}
