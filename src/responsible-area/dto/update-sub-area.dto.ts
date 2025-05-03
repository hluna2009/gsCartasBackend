import { PartialType } from '@nestjs/mapped-types';
import { CreateSubAreaDto } from './create-sub-area.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSubAreaDto extends PartialType(CreateSubAreaDto) {
    @ApiProperty({
        description: 'Nombre de la subárea (opcional)',
        example: 'Subárea de QA',
        required: false,  // No es obligatorio para la actualización
      })
    @IsString()
    @IsOptional()
    nombre?: string;
  
    @ApiProperty({
        description: 'ID del área responsable (opcional)',
        example: 2,  // El nuevo área responsable (opcional)
        required: false,
      })
    @IsNumber()
    @IsOptional()
    areaResponsableId?: number;
  
    @ApiProperty({
        description: 'Procedencia de la subárea (opcional)',
        example: 'Oficina de Lima',
        required: false,
      })
    @IsString()
    @IsOptional()
    procedencia?: string;
  
    @ApiProperty({
        description: 'Jefatura de la subárea (opcional)',
        example: 'Jefe de QA',
        required: false,
      })
    @IsString()
    @IsOptional()
    jefatura?: string;
  
    @ApiProperty({
        description: 'ID del usuario que actualizó la subárea (opcional)',
        example: 456,  // ID de usuario que actualiza
        required: false,
      })
    @IsNumber()
    @IsOptional()
    creadoPorId?: number;
}
