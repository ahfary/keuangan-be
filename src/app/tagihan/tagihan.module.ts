import { Module } from '@nestjs/common';
import { TagihanController } from './tagihan.controller';
import { TagihanService } from './tagihan.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [TagihanController],
  providers: [TagihanService]
})
export class TagihanModule {}
