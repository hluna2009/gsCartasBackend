import { Test, TestingModule } from '@nestjs/testing';
import { SubAreasService } from '../sub-areas/sub-areas.service';

describe('SubAreasService', () => {
  let service: SubAreasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubAreasService],
    }).compile();

    service = module.get<SubAreasService>(SubAreasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
