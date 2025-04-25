import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ResponsibleAreaService } from '../../services/responsible-area/responsible-area.service';
import { CreateResponsibleAreaDto } from '../../dto/create-responsible-area.dto';
import { UpdateResponsibleAreaDto } from '../../dto/update-responsible-area.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('responsible-area')
export class ResponsibleAreaController {
  constructor(private readonly responsibleAreaService: ResponsibleAreaService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva área responsable' })
  @ApiResponse({ status: 201, description: 'Área responsable creada exitosamente' })
  create(@Body() createResponsibleAreaDto: CreateResponsibleAreaDto) {
    return this.responsibleAreaService.create(createResponsibleAreaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las áreas responsables' })
  @ApiResponse({ status: 200, description: 'Áreas responsables obtenidas exitosamente' })
  @ApiResponse({ status: 404, description: 'No se encontraron áreas responsables' })
  findAll() {
    return this.responsibleAreaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un área responsable por ID' })
  @ApiResponse({ status: 200, description: 'Área responsable obtenida exitosamente' })
  @ApiResponse({ status: 404, description: 'Área responsable no encontrada' })
  findOne(@Param('id') id: string) {
    return this.responsibleAreaService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un área responsable' })
  @ApiResponse({ status: 200, description: 'Área responsable actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Área responsable no encontrada' })
  update(@Param('id') id: string, @Body() updateResponsibleAreaDto: UpdateResponsibleAreaDto) {
    return this.responsibleAreaService.update(+id, updateResponsibleAreaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un área responsable por ID' })
  @ApiResponse({ status: 200, description: 'Área responsable eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Área responsable no encontrada' })
  remove(@Param('id') id: string) {
    return this.responsibleAreaService.remove(+id);
  }
}
