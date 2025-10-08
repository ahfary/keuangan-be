import { Test, TestingModule } from '@nestjs/testing';
import { WinpayService } from './winpay.service';

describe('WinpayService', () => {
  let service: WinpayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WinpayService],
    }).compile();

    service = module.get<WinpayService>(WinpayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
