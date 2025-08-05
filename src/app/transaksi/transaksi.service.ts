import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import BaseResponse from 'src/utils/response.utils';
import { Santri } from '../entity/santri.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TransaksiService extends BaseResponse {
    constructor(
        @InjectRepository(Santri) private readonly santri: Repository<Santri>
    ){
        super();
    }

    async topUpSantri(id:number, jumlah:number){
        const santri = await this.santri.findOne({
            where : {
                id : id
            }
        });
        if(!santri){
            throw new HttpException('Santri tidak ditemukan', 404);
        }
        const newSaldo = santri.saldo + jumlah;
        const update = await this.santri.update(id, { saldo: newSaldo });
        return this.success('Saldo berhasil ditambahkan', update);
    }

    async deductSantri(id:number, jumlah:number){
        const santri = await this.santri.findOne({
            where : {
                id : id
            }
        });
        if(!santri){
            throw new HttpException('Santri tidak ditemukan', 404);
        }
        if(santri.saldo < jumlah){
            throw new HttpException('Saldo tidak mencukupi', 400);
        }
        const newSaldo = santri.saldo - jumlah;
        const update = await this.santri.update(id, { saldo: newSaldo });
        return this.success('Saldo berhasil dikurangi', update);
    }
}
