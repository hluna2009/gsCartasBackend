import { Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CompanyService {

  constructor (private prisma: PrismaService){}

  async create(createCompanyDto: CreateCompanyDto) {
    return this.prisma.empresa.create({
      data: {
        ...createCompanyDto
      }
    })
  }

  async findAll() {
    return this.prisma.empresa.findMany()
  }

  async findOne(id: number) {
    return this.prisma.empresa.findUnique({
      where: { id }
    })
  }

  async update(id: number, updateCompanyDto: UpdateCompanyDto) {
    return this.prisma.empresa.update({
      where: { id },
      data: {
        ...updateCompanyDto
      }
    })
  }

  async remove(id: number) {
    return this.prisma.empresa.delete({
      where: { id }
    })
  }
}
