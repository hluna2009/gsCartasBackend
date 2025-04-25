import { PartialType } from '@nestjs/mapped-types';
import { CreateCompanyDto } from './create-company.dto';
import { IsInt, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {
    @ApiProperty({
        description: 'El nombre de la empresa. Este campo es opcional para la actualización y debe ser una cadena de texto.',
        example: 'Mi Empresa Actualizada S.A.',
        required: false,
    })
    @IsString()
    nombre?: string;

    @ApiProperty({
        description: 'El ID del usuario que está actualizando la empresa. Este campo es opcional para la actualización y debe ser un número entero.',
        example: 1,
        required: false,
    })
    @IsInt()
    creadoPorId?: number;
}
