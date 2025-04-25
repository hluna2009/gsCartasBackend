import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRolDto } from 'src/users/dto/create-rol.dto';

@Injectable()
export class RolesService {
    constructor(private prisma: PrismaService) {}

    async create(createRolDto: CreateRolDto) {

        const existingRol = await this.prisma.rol.findFirst({
            where: { nombre: createRolDto.nombre}
        })

        if (existingRol) {
            throw new ConflictException(`Ese Rol ya existe`)
        }

        return this.prisma.rol.create({
            data: {
                ...createRolDto
            },
        });
    }

    async findAll() {
        return this.prisma.rol.findMany();
    }

    async findOne(id: number) {
        const rol =  await this.prisma.rol.findUnique({
            where: { id },
        });
        
        
        if (!rol) {
            throw new NotFoundException(`El rol no existe`)
        }

        return rol
    }

    async update(id: number, updateRolDto: CreateRolDto) {

        const rol = await this.prisma.rol.findUnique({
            where: { id },
        });
        if (!rol) {
            throw new NotFoundException(`El rol no existe`)
        }

        return this.prisma.rol.update({
            where: { id },
            data: {
                ...updateRolDto
            },
        });
    }

    async remove(id: number) {

        const rol = await this.prisma.rol.findUnique({
            where: { id },
        });
        if (!rol) {
            throw new NotFoundException(`El rol no existe`)
        }

        return this.prisma.rol.delete({
            where: { id },
        });
    }
}
