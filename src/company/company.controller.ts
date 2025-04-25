import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva empresa' })
  @ApiResponse({ status: 201, description: 'Empresa creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta' })
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companyService.create(createCompanyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las empresas' })
  @ApiResponse({ status: 200, description: 'Empresas obtenidas exitosamente' })
  @ApiResponse({ status: 404, description: 'No se encontraron empresas' })
  findAll() {
    return this.companyService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una empresa por ID' })
  @ApiResponse({ status: 200, description: 'Empresa obtenida exitosamente' })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada' })
  findOne(@Param('id') id: string) {
    return this.companyService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una empresa existente' })
  @ApiResponse({ status: 200, description: 'Empresa actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada' })
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companyService.update(+id, updateCompanyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una empresa por ID' })
  @ApiResponse({ status: 200, description: 'Empresa eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada' })
  remove(@Param('id') id: string) {
    return this.companyService.remove(+id);
  }
}
