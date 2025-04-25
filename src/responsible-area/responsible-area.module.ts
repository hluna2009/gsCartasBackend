import { Module } from '@nestjs/common';
import { ResponsibleAreaController } from './controllers/responsible-area/responsible-area.controller';
import { ResponsibleAreaService } from './services/responsible-area/responsible-area.service';
import { SubAreasController } from './controllers/sub-areas/sub-areas.controller';
import { SubAreasService } from './services/sub-areas/sub-areas.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ResponsibleAreaController, SubAreasController],
  providers: [ResponsibleAreaService, SubAreasService, PrismaService],
})
export class ResponsibleAreaModule {}
