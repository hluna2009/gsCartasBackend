import { Controller, Get, Post, Param, UploadedFile, UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { FileuploadService } from './fileupload.service';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter, fileNamer } from './helpers';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('fileupload')
export class FileuploadController {
  constructor(
    private readonly fileuploadService: FileuploadService,
    private readonly configService: ConfigService
  ) {}

  @Get('files/:imageName')
  findFile(
    @Res() res: Response,
    @Param('imageName') imageName: string,
  ){
    const path = this.fileuploadService.getStaticProductImage(imageName)
    res.sendFile(path);
  }

  @Post('file')
  @ApiOperation({ summary: 'Subir un archivo pdf'})
  @ApiBody({
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Archivo subido correctamente' })
  @ApiResponse({ status: 400, description: 'El archivo no es válido' })
  @UseInterceptors(
    FileInterceptor('file',{
      fileFilter: fileFilter,
      storage: diskStorage({
        destination: './files',
        filename: fileNamer
      })
    })
  )
  uploadFile(@UploadedFile() file: Express.Multer.File){
    if (!file) {
      throw new BadRequestException('Asegúrese de que el archivo sea un pdf')
    }

    const secureUrl = `${this.configService.get('HOST_API')}/fileupload/files/${file.filename}`;

    return { secureUrl , fileName: file.filename}
  }

  

}
