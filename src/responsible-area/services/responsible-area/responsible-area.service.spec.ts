import { Test, TestingModule } from '@nestjs/testing';
import { ResponsibleAreaService } from './responsible-area.service';

describe('ResponsibleAreaService', () => {
  let service: ResponsibleAreaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResponsibleAreaService],
    }).compile();

    service = module.get<ResponsibleAreaService>(ResponsibleAreaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
