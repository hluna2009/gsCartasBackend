import { Module } from '@nestjs/common';
import { ReceiverService } from './receiver.service';
import { ReceiverController } from './receiver.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ReceiverController],
  providers: [ReceiverService, PrismaService],
})
export class ReceiverModule {}
