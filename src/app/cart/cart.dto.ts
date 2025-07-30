import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class AddToCartDto {
    @IsNumber()
    @IsNotEmpty()
    santriId: number;

    @IsNumber()
    itemId: number;

    @IsNumber()
    @Min(1)
    quantity: number;
}
