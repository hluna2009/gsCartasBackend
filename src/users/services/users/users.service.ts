import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './../../dto/create-user.dto';
import { UpdateUserDto } from './../../dto/update-user.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {

    const hashedPassword = await bcrypt.hash(createUserDto.contraseña, 10);
    console.log("data", createUserDto)

    const user = await this.prisma.usuario.create({
      data: {
        ...createUserDto,
        contraseña: hashedPassword
      },
    });

    return user;
  }

  async findAll(paginationDto: PaginationDto) {

    const { page, limit, search, searchBy, filters } = paginationDto;
    
    console.log("que recibimos", paginationDto);
    console.log("searchBy", searchBy);
    console.log("searchBy - tipo ", typeof(searchBy));
    
    let where = {}

    if (search && searchBy) {
      where = {
        OR: searchBy.map((column)=>({
          [column]: {
            contains: search,
            mode: 'insensitive'
          }
        }))
      }
    }
    if (filters) {
      where = {
        ...where,
        AND: Object.keys(filters).map((key)=>({
          [key]: filters[key]
        }))
      }
    }
    console.log(where)

    const total = await this.prisma.usuario.count({where})
    const data = await this.prisma.usuario.findMany({
      where,
      skip: (page -1) * Number(limit),
      take: Number(limit),
      orderBy: { id: 'asc' },
      include: {rol: true, area: true, subArea: true}
    })

    return {
      data,
      meta: {
        total,
        page,
        limit,
        last_page: Math.ceil(total / limit),
      }
    }
  }

  async findOne(id: number) {
    return this.prisma.usuario.findUnique({
      where: { id }
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { areaId, subAreaId, rolId, contraseña, ...rest} = updateUserDto

    const hashedPassword = await bcrypt.hash(contraseña, 10);

    try {
      return await this.prisma.usuario.update({
        where: { id: id},
        data: {
          ...rest,
          area: areaId? {connect: {id: areaId}}: undefined,
          subArea: subAreaId?{connect: {id: subAreaId}}: undefined,
          rol: rolId ? {connect: {id: rolId}}: undefined,
          contraseña: hashedPassword
        },
      })
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Uno de los registros relacionados no existe')
      }
      throw error;
    }

  }

  async remove(id: number) {
    return this.prisma.usuario.delete({
      where: { id },
    });
  }
}
