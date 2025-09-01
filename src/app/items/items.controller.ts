import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { createItemDto } from './items.dto';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  getAllItems(@Query('kategori') kategori?: string, @Query('barcode') barcode?: string) {
    return this.itemsService.getAllItems(kategori,barcode);
  }

  @Get('count')
  async countItems() {
    return this.itemsService.countItems();
  }

  @Get(':id')
  async getItemById(@Param('id', ParseIntPipe) id: number) {
    return this.itemsService.getItemById(id);
  }

  @Post('create')
  @UseInterceptors(FileInterceptor('gambar')) // 'gambar' adalah nama field untuk file
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createItemDto: createItemDto,
  ) {
    return this.itemsService.createItem(createItemDto, file);
  }

  @Put('update/:id')
  async updateItem(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.itemsService.updateItem(id, data);
  }

  @Delete('delete/:id')
  async deleteItem(@Param('id', ParseIntPipe) id: number) {
    return this.itemsService.deleteItem(id);
  }
}
