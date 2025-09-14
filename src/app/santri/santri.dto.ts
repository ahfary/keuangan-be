import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';
import { Jurusan } from '../entity/santri.entity';

export class DeductSaldoDto {
  @IsInt()
  @IsPositive()
  jumlah: number;
}

export class CreateSantriDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  kelas: string;

  @IsEnum(Jurusan, {message: 'Jurusan harus salah satu dari TKJ atau RPL'})
  @IsOptional()
  jurusan?: Jurusan;
}

export class UpdateSantriDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  kelas?: string;
  
  @IsEnum(Jurusan, {message: 'Jurusan harus salah satu dari TKJ atau RPL'})
  @IsOptional()
  jurusan?: Jurusan;
}
