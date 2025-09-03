import { IsNotEmpty, IsNumber, IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class ItemDetailsDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsNotEmpty()
  name: string;
}

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  orderId: string; // ID unik dari sistem Anda (misal: INVOICE-001)

  @IsNumber()
  @IsNotEmpty()
  grossAmount: number; // Total harga

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDetailsDto)
  items: ItemDetailsDto[];
}