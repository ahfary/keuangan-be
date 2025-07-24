import { HttpException, Injectable } from '@nestjs/common';
import BaseResponse from 'src/utils/response.utils';
import { PrismaService } from '../prisma/prisma.service';
import { ResponseSuccess } from 'src/interface/response.interface';

@Injectable()
export class ItemsService extends BaseResponse {
    constructor (
        private prismaService : PrismaService
    ){
        super();
    }

    async getAllItems():Promise<ResponseSuccess> {
        const items = await this.prismaService.items.findMany();
        if(items.length == 0) {
            throw new HttpException('Items not found', 404);
        }
        return this.success('Items retrieved successfully', items);
    }

    async getItemById(id: number):Promise<ResponseSuccess> {
        const item = await this.prismaService.items.findUnique({
            where: { id }
        });
        if (!item) {
            throw new HttpException('Item not found', 404);
        }
        return this.success('Item retrieved successfully', item);
    }

    async createItem(data: any):Promise<ResponseSuccess> {
        const newItem = await this.prismaService.items.create({
            data
        });
        return this.success('Item created successfully', newItem);
    }

    async updateItem(id: number, data: any):Promise<ResponseSuccess> {
        const updatedItem = await this.prismaService.items.update({
            where: { id },
            data
        });
        return this.success('Item updated successfully', updatedItem);
    }

    async deleteItem(id: number):Promise<ResponseSuccess> {
        const deletedItem = await this.prismaService.items.delete({
            where: { id }
        });
        return this.success('Item deleted successfully', deletedItem);
    }
}
