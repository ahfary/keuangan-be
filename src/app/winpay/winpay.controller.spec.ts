import { Test, TestingModule } from '@nestjs/testing';
import { WinpayController } from './winpay.controller';

describe('WinpayController', () => {
  let controller: WinpayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WinpayController],
    }).compile();

    controller = module.get<WinpayController>(WinpayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
