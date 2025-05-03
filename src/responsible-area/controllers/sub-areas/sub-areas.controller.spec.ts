import { Test, TestingModule } from '@nestjs/testing';
import { SubAreasController } from './sub-areas.controller';
import { SubAreasService } from './sub-areas.service';

describe('SubAreasController', () => {
  let controller: SubAreasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubAreasController],
      providers: [SubAreasService],
    }).compile();

    controller = module.get<SubAreasController>(SubAreasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
