import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { SantriService } from './santri.service';
import { JwtGuard } from '../auth/jwt.guard';
import { DeductSaldoDto } from './santri.dto';

@Controller('santri')
export class SantriController {
    constructor(private readonly santriService: SantriService) {}

    @Get()
    async getAllSantri() {
        return this.santriService.getAllSantri();
    }

    @Get(':id')
    async getSantriDetail(@Param('id', ParseIntPipe) id:number) {
        return this.santriService.getSantriDetail(id);
    }

    @Post('deduct/:id')
    async deductSantri(@Param('id', ParseIntPipe) id:number,@Body() dto:DeductSaldoDto) {
        return this.santriService.deductSantri(id, dto.jumlah);
    }

    @Post('create')
    async createSantri(@Body() data: any) {
        return this.santriService.createSantri(data);
    }

    @Put('update/:id')
    async updateSantri(@Param('id', ParseIntPipe) id:number, @Body() data: any) {
        return this.santriService.updateSantri(id, data);
    }

    @Delete('delete/:id')
    async deleteSantri(@Param('id', ParseIntPipe) id:number) {
        return this.santriService.deleteSantri(id);
    }
}
