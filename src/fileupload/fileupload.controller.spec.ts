import { Test, TestingModule } from '@nestjs/testing';
import { FileuploadController } from './fileupload.controller';
import { FileuploadService } from './fileupload.service';

describe('FileuploadController', () => {
  let controller: FileuploadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileuploadController],
      providers: [FileuploadService],
    }).compile();

    controller = module.get<FileuploadController>(FileuploadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
