import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
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

    @Post('deduct/:id')
    async deductSantri(@Param('id', ParseIntPipe) id:number,@Body() dto:DeductSaldoDto) {
        return this.santriService.deductSantri(id, dto.jumlah);
    }
}
