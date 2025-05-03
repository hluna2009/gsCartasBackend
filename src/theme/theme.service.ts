import { Injectable } from '@nestjs/common';
import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ThemeService {

  constructor(private prisma: PrismaService){}

  async create(createThemeDto: CreateThemeDto) {
    return this.prisma.tema.create({
      data: {
        ...createThemeDto
      }
    })
  }

  async findAll() {
    return this.prisma.tema.findMany()
  }

  async findOne(id: number) {
    return this.prisma.tema.findUnique({
      where: { id }
    })
  }

  async update(id: number, updateThemeDto: UpdateThemeDto) {
    return this.prisma.tema.update({
      where: { id },
      data: {
        ...updateThemeDto
      }
    })
  }

  async remove(id: number) {
    return this.prisma.tema.delete({
      where: { id }
    })
  }
}
