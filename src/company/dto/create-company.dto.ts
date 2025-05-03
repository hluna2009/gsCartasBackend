import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString } from "class-validator";

export class CreateCompanyDto {
    @ApiProperty({
        description: 'El nombre de la empresa. Este campo es obligatorio y debe ser una cadena de texto.',
        example: 'Mi Empresa S.A.',
    })
    @IsString()
    nombre: string;

    @ApiProperty({
        description: 'El ID del usuario que crea la empresa. Este campo es opcional y debe ser un número entero.',
        example: 1,
        required: false,
    })
    @IsOptional()
    @IsInt()
    creadoPorId: number;
}
