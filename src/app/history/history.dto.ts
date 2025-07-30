import { IsInt, IsNotEmpty } from 'class-validator';

export class CheckoutDto {
  @IsInt()
  @IsNotEmpty()
  santriId: number;
}