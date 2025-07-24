import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

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
  kelas:string
}