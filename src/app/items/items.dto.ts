import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class createItemDto {
  @IsNotEmpty()
  @IsString()
  nama: string;

  @IsNotEmpty()
  harga: number;

  @IsNotEmpty()
  jumlah: number;

  @IsNotEmpty()
  kategoriId?: number;
}

export class UpdateItemDto extends PartialType(createItemDto) {}
