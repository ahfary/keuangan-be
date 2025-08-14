import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class createItemDto {
  @IsNotEmpty()
  @IsString()
  nama: string;

  @IsNotEmpty()
  // @IsInt()
  harga: number;

  @IsNotEmpty()
  @IsString()
  kategori: string;

  @IsNotEmpty()
  // @IsInt()
  jumlah: number;

  @IsNotEmpty()
  kategoriId?: number;
}
