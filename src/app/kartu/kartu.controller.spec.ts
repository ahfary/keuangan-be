import { Test, TestingModule } from '@nestjs/testing';
import { KartuController } from './kartu.controller';

describe('KartuController', () => {
  let controller: KartuController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KartuController],
    }).compile();

    controller = module.get<KartuController>(KartuController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
