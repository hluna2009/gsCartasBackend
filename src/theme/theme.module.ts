import { Module } from '@nestjs/common';
import { ThemeService } from './theme.service';
import { ThemeController } from './theme.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ThemeController],
  providers: [ThemeService, PrismaService],
})
export class ThemeModule {}
