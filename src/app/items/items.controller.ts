import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ItemsService } from './items.service';

@Controller('items')
export class ItemsController {
    constructor(
        private readonly itemsService: ItemsService
    ){}

    @Get()
    async getAllItems() {
        return this.itemsService.getAllItems();
    }

    @Get(':id')
    async getItemById(@Param('id', ParseIntPipe) id: number) {
        return this.itemsService.getItemById(id);
    }

    @Post('create')
    async createItem(@Body() data: any) {
        return this.itemsService.createItem(data);
    }

    @Put('update/:id')
    async updateItem(@Param('id', ParseIntPipe) id: number,@Body() data: any) {
        return this.itemsService.updateItem(id, data);
    }

    @Delete('delete/:id')
    async deleteItem(@Param('id', ParseIntPipe) id: number) {
        return this.itemsService.deleteItem(id);
    }
}
