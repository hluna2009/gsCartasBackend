import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { join } from 'path';
import { existsSync } from 'fs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileuploadService {
  private readonly logger = new Logger(FileuploadService.name)
  private readonly uploadPath: string;

  constructor(
    private readonly configService: ConfigService
  ){
    const isProduction = this.configService.get('NODE_ENV') === 'prod';
    this.uploadPath = isProduction 
      ? join(__dirname, '../files/')  // En producción, desde dist/files/
      : join(__dirname, '../../files/'); // En desarrollo, desde src/files/

    this.logger.log(`File upload path configured for ${isProduction ? 'production' : 'development'}: ${this.uploadPath}`);
  }

  getStaticProductImage(imageName: string) {
    const path = join(this.uploadPath, imageName);

    this.logger.log(`Resolved file path: ${path}`);
    if (!existsSync(path)) {
      throw new BadRequestException(`No product found with image ${imageName}`);
    }

    return path;
  }

}
