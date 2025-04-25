import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ThemeService } from './theme.service';
import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('theme')
export class ThemeController {
  constructor(private readonly themeService: ThemeService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo tema' })
  @ApiResponse({ status: 201, description: 'Tema creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta' })
  create(@Body() createThemeDto: CreateThemeDto) {
    return this.themeService.create(createThemeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los temas' })
  @ApiResponse({ status: 200, description: 'Temas obtenidos exitosamente' })
  @ApiResponse({ status: 404, description: 'No se encontraron temas' })
  findAll() {
    return this.themeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un tema por ID' })
  @ApiResponse({ status: 200, description: 'Tema obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Tema no encontrado' })
  findOne(@Param('id') id: string) {
    return this.themeService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un tema existente' })
  @ApiResponse({ status: 200, description: 'Tema actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Tema no encontrado' })
  update(@Param('id') id: string, @Body() updateThemeDto: UpdateThemeDto) {
    return this.themeService.update(+id, updateThemeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un tema por ID' })
  @ApiResponse({ status: 200, description: 'Tema eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Tema no encontrado' })
  remove(@Param('id') id: string) {
    return this.themeService.remove(+id);
  }
}
