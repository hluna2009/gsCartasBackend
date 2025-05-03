import { Test, TestingModule } from '@nestjs/testing';
import { ResponsibleAreaController } from '../responsible-area.controller';
import { ResponsibleAreaService } from './responsible-area.service';

describe('ResponsibleAreaController', () => {
  let controller: ResponsibleAreaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResponsibleAreaController],
      providers: [ResponsibleAreaService],
    }).compile();

    controller = module.get<ResponsibleAreaController>(ResponsibleAreaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
