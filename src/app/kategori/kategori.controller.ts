import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { KategoriService } from './kategori.service';

@Controller('kategori')
export class KategoriController {
    constructor(private readonly kategoriService: KategoriService) {}

    @Get()
    async getAllKategori() {
        return this.kategoriService.getAllKategori();
    }

    @Get(':id')
    async getKategoriDetail(@Param('id', ParseIntPipe) id: number) {
        return this.kategoriService.getKategoriDetail(id);
    }

    @Post('create')
    async createKategori(@Body() data: any) {
        return this.kategoriService.createKategori(data);
    }

    @Post('update/:id')
    async updateKategori(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
        return this.kategoriService.updateKategori(id, data);
    }

    @Delete('delete/:id')
    async deleteKategori(@Param('id', ParseIntPipe) id: number) {
        return this.kategoriService.deleteKategori(id);
    }
}
