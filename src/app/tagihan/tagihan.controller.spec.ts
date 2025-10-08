import { Test, TestingModule } from '@nestjs/testing';
import { TagihanController } from './tagihan.controller';

describe('TagihanController', () => {
  let controller: TagihanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagihanController],
    }).compile();

    controller = module.get<TagihanController>(TagihanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
