import { Module } from '@nestjs/common';
import { KartuController } from './kartu.controller';
import { KartuService } from './kartu.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kartu } from '../entity/kartu_santri.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Kartu])],
  controllers: [KartuController],
  providers: [KartuService],
})
export class KartuModule {}
