import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateRolDto {
    @ApiProperty({
        description: 'El nombre del rol',
        example: 'Administrador',  // Puedes poner un ejemplo para mayor claridad
      })
    @IsString()
    nombre: string;

    @ApiProperty({
        description: 'ID del usuario que creó el rol (opcional)',
        example: 12345,  // Ejemplo de valor
        required: false,  // Ya que es opcional, se marca como no requerido
      })
    @IsOptional()
    @IsNumber()
    creadoPorId?: bigint;
}