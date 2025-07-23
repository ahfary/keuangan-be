import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeductSaldoDto } from './santri.dto';

@Injectable()
export class SantriService {
    constructor(
        private prismaService: PrismaService,
    ){}

    async getAllSantri() {
        return this.prismaService.santri.findMany();
    }

    async getSantriDetail(id:number){
        const detail = await this.prismaService.santri.findFirst({
            where : {
                id : id
            }
        })
        return detail;
    }

    async deductSantri(id:number, jumlah:number){
        const santri = await this.prismaService.santri.findFirst({
            where : {
                id : id
            }
        })
        if(!santri){
            throw new HttpException('Santri tidak ditemukan', 404);
        }
        if(santri.saldo < jumlah){
            throw new HttpException('Saldo tidak mencukupi', 400);
        }
        const newSaldo = santri.saldo - jumlah;
        const update = await this.prismaService.santri.update({
            where : {
                id : id
            },
            data : {
                saldo : newSaldo
            }
        })
        return update;
    }
}
