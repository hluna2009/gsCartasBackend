import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsInt, IsOptional, IsString } from "class-validator";

export class CreateThemeDto {

    @ApiProperty({
        description: 'El nombre del tema. Este campo es obligatorio y debe ser una cadena de texto.',
        example: 'Partes',
    })
    @IsString()
    nombre: string;

    @ApiProperty({
        description: 'El ID del usuario que creó el tema. Este campo es opcional y debe ser un número entero.',
        example: 1,
        required: false,
    })
    @IsOptional()
    @IsInt()
    creadorPorId: number;
}
