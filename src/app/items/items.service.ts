import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import BaseResponse from 'src/utils/response.utils';
import { PrismaService } from '../prisma/prisma.service';
import { ResponseSuccess } from 'src/interface/response.interface';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { createItemDto } from './items.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Items } from '../entity/items.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ItemsService extends BaseResponse {
  constructor(
    @InjectRepository(Items) private readonly items: Repository<Items>,
    private cloudinaryService: CloudinaryService,
  ) {
    super();
  }

  async getAllItems(): Promise<ResponseSuccess> {
    const items = await this.items.find();
    if (items.length == 0) {
      throw new HttpException('Items not found', 404);
    }
    return this.success('Items retrieved successfully', items);
  }

  async getItemById(id: number): Promise<ResponseSuccess> {
    const item = await this.items.findOne({
      where: {
        id: id,
      },
    });
    if (!item) {
      throw new HttpException('Item not found', 404);
    }
    return this.success('Item retrieved successfully', item);
  }

  async createItem(
    data: createItemDto,
    file: Express.Multer.File,
  ): Promise<ResponseSuccess> {
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
        kategoriId: data.kategoriId ? Number(data.kategoriId) : null,
      };

      const newItem = await this.items.save(dataToSave as any);

      return this.success('Item berhasil dibuat dengan gambar', newItem);
    } catch (error) {
      // Handle error jika upload gagal
      throw new InternalServerErrorException(
        'Gagal mengunggah gambar atau menyimpan item.',
      );
    }
  }

  async updateItem(id: number, data: any): Promise<ResponseSuccess> {
    const updatedItem = await this.items.findOneBy({ id: id });
    await this.items.update(id, data);
    return this.success('Item updated successfully', updatedItem);
  }

  async deleteItem(id: number): Promise<ResponseSuccess> {
    const deletedItem = await this.items.findOneBy({ id: id });
    await this.items.delete(id);
    return this.success('Item deleted successfully', deletedItem);
  }
}
