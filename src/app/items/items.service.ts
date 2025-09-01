import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import BaseResponse from 'src/utils/response.utils';
import { ResponseSuccess } from 'src/interface/response.interface';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { createItemDto, UpdateItemDto } from './items.dto';
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

  async getAllItems(namaKategori?: string, barcode?: string): Promise<ResponseSuccess> {
  let items;

  if (namaKategori && barcode) {
    // Filter kategori + barcode
    items = await this.items.find({
      relations: ['kategori'],
      where: {
        kategori: { nama: namaKategori },
        barcode: barcode,
      },
    });
  } else if (namaKategori) {
    // Filter hanya kategori
    items = await this.items.find({
      relations: ['kategori'],
      where: {
        kategori: { nama: namaKategori },
      },
    });
  } else if (barcode) {
    // Filter hanya barcode
    items = await this.items.find({
      relations: ['kategori'],
      where: {
        barcode: barcode,
      },
    });
  } else {
    // Ambil semua
    items = await this.items.find({
      relations: ['kategori'],
    });
  }

  if (items.length === 0) {
    throw new HttpException('Items not found', 404);
  }

  return this.success('Items retrieved successfully', items);
}



  async countItems(): Promise<ResponseSuccess> {
    const countItem = await this.items.count();
    return this.success('Success', countItem);
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

  async updateItem(id: number, data: UpdateItemDto, file?: Express.Multer.File): Promise<ResponseSuccess> {
  const item = await this.items.findOneBy({ id });
  if (!item) {
    throw new NotFoundException('Item tidak ditemukan');
  }

  let updatedImageUrl = item.gambar;
  if (file) {
    const uploadedImage = await this.cloudinaryService.uploadFile(file);
    updatedImageUrl = uploadedImage.secure_url;
  }

  const dataToUpdate = {
    ...data,
    harga: data.harga ? Number(data.harga) : item.harga,
    jumlah: data.jumlah ? Number(data.jumlah) : item.jumlah,
    gambar: updatedImageUrl,
    kategoriId: data.kategoriId ? Number(data.kategoriId) : item.kategoriId,
  };

  const updatedItem = await this.items.save({ ...item, ...dataToUpdate });

  return this.success('Item updated successfully', updatedItem);
}



  async deleteItem(id: number): Promise<ResponseSuccess> {
    const deletedItem = await this.items.findOneBy({ id: id });
    await this.items.delete(id);
    return this.success('Item deleted successfully', deletedItem);
  }
}
