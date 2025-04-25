import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SubAreasService } from '../../services/sub-areas/sub-areas.service';
import { CreateSubAreaDto } from '../../dto/create-sub-area.dto';
import { UpdateSubAreaDto } from '../../dto/update-sub-area.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('sub-areas')
export class SubAreasController {
  constructor(private readonly subAreasService: SubAreasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva subárea' })
  @ApiResponse({ status: 201, description: 'Subárea creada exitosamente' })
  create(@Body() createSubAreaDto: CreateSubAreaDto) {
    return this.subAreasService.create(createSubAreaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las subáreas' })
  @ApiResponse({ status: 200, description: 'Subáreas obtenidas exitosamente' })
  @ApiResponse({ status: 404, description: 'No se encontraron subáreas' })
  findAll() {
    return this.subAreasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una subárea por ID' })
  @ApiResponse({ status: 200, description: 'Subárea obtenida exitosamente' })
  @ApiResponse({ status: 404, description: 'Subárea no encontrada' })
  findOne(@Param('id') id: string) {
    return this.subAreasService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una subárea existente' })
  @ApiResponse({ status: 200, description: 'Subárea actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Subárea no encontrada' })
  update(@Param('id') id: string, @Body() updateSubAreaDto: UpdateSubAreaDto) {
    return this.subAreasService.update(+id, updateSubAreaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una subárea por ID' })
  @ApiResponse({ status: 200, description: 'Subárea eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Subárea no encontrada' })
  remove(@Param('id') id: string) {
    return this.subAreasService.remove(+id);
  }
}
