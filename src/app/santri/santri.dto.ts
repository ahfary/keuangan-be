import { IsInt, IsPositive } from 'class-validator';

export class DeductSaldoDto {
  @IsInt()
  @IsPositive()
  jumlah: number;
}
