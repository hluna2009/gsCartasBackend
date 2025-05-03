import { Module } from '@nestjs/common';
import { FileuploadService } from './fileupload.service';
import { FileuploadController } from './fileupload.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [FileuploadController],
  providers: [FileuploadService],
  imports: [ConfigModule]
})
export class FileuploadModule {}
