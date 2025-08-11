import { Test, TestingModule } from '@nestjs/testing';
import { KartuService } from './kartu.service';

describe('KartuService', () => {
  let service: KartuService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KartuService],
    }).compile();

    service = module.get<KartuService>(KartuService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
