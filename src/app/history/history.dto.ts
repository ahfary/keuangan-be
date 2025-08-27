import { IsInt, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CheckoutItemDto {
  @IsInt()
  itemId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CheckoutDto {
  @IsInt()
  santriId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto) // wajib biar nested object dibaca
  items: CheckoutItemDto[];
}
