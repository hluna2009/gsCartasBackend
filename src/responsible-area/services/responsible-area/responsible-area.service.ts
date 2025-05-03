import { Injectable } from '@nestjs/common';
import { CreateResponsibleAreaDto } from '../../dto/create-responsible-area.dto';
import { UpdateResponsibleAreaDto } from '../../dto/update-responsible-area.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ResponsibleAreaService {

  constructor(private prisma: PrismaService){}

  async create(createResponsibleAreaDto: CreateResponsibleAreaDto) {
    return this.prisma.areaResponsable.create({
      data: {
        ...createResponsibleAreaDto
      }
    })
  }

  async findAll() {
    return this.prisma.areaResponsable.findMany({
      include: { subAreas: true },
      orderBy: {
        id: 'desc'
      }
    })
  }

  async findOne(id: number) {
    return this.prisma.areaResponsable.findUnique({
      where: { id }
    })
  }

  async update(id: number, updateResponsibleAreaDto: UpdateResponsibleAreaDto) {
    return this.prisma.areaResponsable.update({
      where: { id },
      data: {
        ...updateResponsibleAreaDto
      }
    })
  }

  async remove(id: number) {
    return this.prisma.areaResponsable.delete({
      where: { id }
    })
  }
}
