import { Test, TestingModule } from '@nestjs/testing';
import { SantriService } from './santri.service';

describe('SantriService', () => {
  let service: SantriService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SantriService],
    }).compile();

    service = module.get<SantriService>(SantriService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
