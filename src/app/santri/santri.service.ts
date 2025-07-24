import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeductSaldoDto } from './santri.dto';
import { ResponseSuccess } from 'src/interface/response.interface';
import BaseResponse from 'src/utils/response.utils';

@Injectable()
export class SantriService extends BaseResponse {
    constructor(
        private prismaService: PrismaService,
    ){
        super()
    }

    async getAllSantri(): Promise<ResponseSuccess> {
        const santri = await this.prismaService.santri.findMany();
        return this.success('Success', santri);
    }

    async getSantriDetail(id:number){
        const detail = await this.prismaService.santri.findFirst({
            where : {
                id : id
            }
        })
        return this.success('Success', detail);
    }

    async createSantri(data:any):Promise<ResponseSuccess> {
        const santri = await this.prismaService.santri.create({
            data : data
        })
        return this.success('Santri created successfully', santri);
    }

    async updateSantri(id:number, data:any){
        const santri = await this.prismaService.santri.update({
            where : {
                id : id
            },
            data : data
        })
        return this.success('Santri updated successfully', santri);
    }

    async deleteSantri(id:number){
        const santri = await this.prismaService.santri.delete({
            where : {
                id : id
            }
        })
        return this.success('Santri deleted successfully', santri);
    }
// Saldo
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
        return this.success('Saldo berhasil dikurangi', update);
    }
}
