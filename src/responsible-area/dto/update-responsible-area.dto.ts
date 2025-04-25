import { PartialType } from '@nestjs/mapped-types';
import { CreateResponsibleAreaDto } from './create-responsible-area.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateResponsibleAreaDto extends PartialType(CreateResponsibleAreaDto) {
    
    @ApiProperty({
        description: 'Nombre de la área responsable',
        example: 'Área de Ventas',  
        required: false,  
      })
    @IsString()
    @IsOptional()
    nombre?: string;
  
    @ApiProperty({
        description: 'Procedencia del responsable (opcional)',
        example: 'Sucursal Norte',
        required: false,
      })
    @IsString()
    @IsOptional()
    procedencia?: string;
  
    @ApiProperty({
        description: 'ID del usuario que actualizó el registro (opcional)',
        example: 456,  // Ejemplo de ID de usuario que actualiza
        required: false,
      })
    @IsNumber()
    @IsOptional()
    creadoPorId?: number;
}
