import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateRolDto } from 'src/users/dto/create-rol.dto';
import { RolesService } from 'src/users/services/roles/roles.service';

@Controller('roles')
export class RolesController {
    constructor(private readonly rolesServices: RolesService) {}

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo rol' })
    @ApiResponse({ status: 201, description: 'Rol creado exitosamente' })
    @ApiResponse({ status: 400, description: 'Solicitud incorrecta' })
    create(@Body() createRolDto: CreateRolDto) {
        return this.rolesServices.create(createRolDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los roles' })
    @ApiResponse({ status: 200, description: 'Roles obtenidos exitosamente' })
    @ApiResponse({ status: 404, description: 'No se encontraron roles' })
    findAll() {
        return this.rolesServices.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un rol por ID' })
    @ApiResponse({ status: 200, description: 'Rol obtenido exitosamente' })
    @ApiResponse({ status: 404, description: 'Rol no encontrado' })
    findOne(@Param('id') id: string) {
        return this.rolesServices.findOne(+id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar un rol existente' })
    @ApiResponse({ status: 200, description: 'Rol actualizado exitosamente' })
    @ApiResponse({ status: 404, description: 'Rol no encontrado' })
    update(@Param('id') id: string, @Body() updateRolDto: CreateRolDto) {
        return this.rolesServices.update(+id, updateRolDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un rol por ID' })
    @ApiResponse({ status: 200, description: 'Rol eliminado exitosamente' })
    @ApiResponse({ status: 404, description: 'Rol no encontrado' })
    remove(@Param('id') id: string) {
        return this.rolesServices.remove(+id);
    }
}
