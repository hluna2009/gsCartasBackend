import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  ConsoleLogger,
  LoggerService,
  ValidationPipe,
} from '@nestjs/common';
import { BigIntInterceptor } from './intercerptors/bigint.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
//import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as fs from 'fs';
import * as path from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

// Logger personalizado que escribe en consola y en archivo
class FileLogger extends ConsoleLogger implements LoggerService {
  private readonly logFilePath: string;
  private readonly logStream: fs.WriteStream;

  constructor(context?: string) {
    super(context);
    this.logFilePath = path.join(process.cwd(), 'access.log');
    this.logStream = fs.createWriteStream(this.logFilePath, { flags: 'a' });

    // Manejar errores en el stream
    this.logStream.on('error', (err) => {
      super.error(`Error writing to log file: ${err.message}`, err.stack);
    });
  }

  log(message: any, context?: string) {
    super.log(message, context);
    this.writeToFile('LOG', message, context);
  }

  error(message: any, trace?: string, context?: string) {
    super.error(message, trace, context);
    this.writeToFile('ERROR', message, context, trace);
  }

  warn(message: any, context?: string) {
    super.warn(message, context);
    this.writeToFile('WARN', message, context);
  }

  debug(message: any, context?: string) {
    super.debug(message, context);
    this.writeToFile('DEBUG', message, context);
  }

  verbose(message: any, context?: string) {
    super.verbose(message, context);
    this.writeToFile('VERBOSE', message, context);
  }

  private writeToFile(
    level: string,
    message: any,
    context?: string,
    trace?: string,
  ) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} [${level}] ${context ? `[${context}] ` : ''}${message}\n${
      trace ? `${trace}\n` : ''
    }`;

    this.logStream.write(logEntry);
  }

  onApplicationShutdown() {
    this.logStream.end();
  }
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new FileLogger(),
  });

  app.setBaseViewsDir(path.join(__dirname, '..', 'src', 'mail', 'templates'));
  app.setViewEngine('hbs');

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.setGlobalPrefix('api/v1');
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     transform: true,
  //     transformOptions: {
  //       enableImplicitConversion: true,
  //     },
  //   }),
  // );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const messages = errors.map(
          (err) =>
            `${err.property} - ${Object.values(err.constraints).join(', ')}`,
        );
        return new BadRequestException(messages);
      },
    }),
  );
  app.useGlobalInterceptors(new BigIntInterceptor());
  //app.useGlobalFilters(new HttpExceptionFilter())

  const config = new DocumentBuilder()
    .setTitle('Cartas')
    .setDescription('API de Cartas')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    swaggerOptions: {
      defaultModelRendering: 'model',
    },
  });

  await app.listen(process.env.PORT ?? 3003);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
