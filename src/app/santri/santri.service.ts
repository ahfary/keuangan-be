import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeductSaldoDto } from './santri.dto';
import { ResponseSuccess } from 'src/interface/response.interface';
import BaseResponse from 'src/utils/response.utils';
import { InjectRepository } from '@nestjs/typeorm';
import { Santri } from '../entity/santri.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SantriService extends BaseResponse {
    constructor(
        // private prismaService: PrismaService,
        @InjectRepository(Santri)private readonly santri:Repository<Santri>
    ){
        super()
    }

    async getAllSantri(): Promise<ResponseSuccess> {
        const santri = await this.santri.find();
        return this.success('Success', santri);
    }

    async getSantriDetail(id:number){
        const detail = await this.santri.findOne({
            where : {
                id : id
            }
        })
        return this.success('Success', detail);
    }

    async createSantri(data:any):Promise<ResponseSuccess> {
        const santri = await this.santri.save(data);
        return this.success('Santri created successfully', santri);
    }

    async updateSantri(id:number, data:any){
        const santri = await this.santri.findOne({
            where : {
                id : id
            }
        })
        await this.santri.update(id, data);
        return this.success('Santri updated successfully', santri);
    }

    async deleteSantri(id:number){
        const santri = await this.santri.findOne({
            where : {
                id : id
            }
        })
        await this.santri.delete(id);
        return this.success('Santri deleted successfully', santri);
    }
}
