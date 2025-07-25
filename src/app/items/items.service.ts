import { BadRequestException, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import BaseResponse from 'src/utils/response.utils';
import { PrismaService } from '../prisma/prisma.service';
import { ResponseSuccess } from 'src/interface/response.interface';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { createItemDto } from './items.dto';

@Injectable()
export class ItemsService extends BaseResponse {
    constructor (
        private prismaService : PrismaService,
        private cloudinaryService: CloudinaryService
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

    async createItem(data: createItemDto, file: Express.Multer.File): Promise<ResponseSuccess> {
    if (!file) {
        throw new BadRequestException('File gambar wajib diisi');
    }

    try {
        const uploadedImage = await this.cloudinaryService.uploadFile(file);

        const dataToSave = {
            ...data,
            harga: Number(data.harga),
            jumlah: Number(data.jumlah),
            gambar: uploadedImage.secure_url,
        };

        const newItem = await this.prismaService.items.create({
            data: dataToSave,
        });

        return this.success('Item berhasil dibuat dengan gambar', newItem);

    } catch (error) {
        // Handle error jika upload gagal
        throw new InternalServerErrorException('Gagal mengunggah gambar atau menyimpan item.');
    }
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
