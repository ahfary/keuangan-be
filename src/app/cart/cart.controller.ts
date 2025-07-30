import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  addToCart(@Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(addToCartDto);
  }

  @Get(':santriId')
  getCart(@Param('santriId', ParseIntPipe) santriId: number) {
    return this.cartService.getCart(santriId);
  }

  @Delete('item/:cartItemId')
  removeItem(@Param('cartItemId', ParseIntPipe) cartItemId: number) {
    return this.cartService.removeItemFromCart(cartItemId);
  }
}
