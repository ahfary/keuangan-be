import { Test, TestingModule } from '@nestjs/testing';
import { SantriController } from './santri.controller';

describe('SantriController', () => {
  let controller: SantriController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SantriController],
    }).compile();

    controller = module.get<SantriController>(SantriController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
