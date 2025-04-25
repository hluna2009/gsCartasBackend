import { PartialType } from '@nestjs/mapped-types';
import { CreateThemeDto } from './create-theme.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateThemeDto extends PartialType(CreateThemeDto) {
    
    @ApiProperty({
        description: 'El nombre del tema. Este campo es opcional para la actualización y debe ser una cadena de texto.',
        example: 'Partes Diarios Actualizada',
        required: false,
    })
    @IsOptional()
    @IsString()
    nombre?: string;

    @ApiProperty({
        description: 'El ID del usuario que está actualizando el tema. Este campo es opcional para la actualización y debe ser un número entero.',
        example: 1,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    creadorPorId?: number;
}
