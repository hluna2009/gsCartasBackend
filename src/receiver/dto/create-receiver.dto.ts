import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateReceiverDto {
    @ApiProperty({
        description: 'El tipo de documento. Este campo es obligatorio y debe ser una cadena de texto.',
        example: 'DNI',
    })
    @IsString()
    tipodoc: string;

    @ApiProperty({
        description: 'El número de doc. Este campo es obligatorio y debe ser una cadena de texto.',
        example: '876543299',
    })
    @IsString()
    numdoc: string;

    @ApiProperty({
        description: 'El nombre del destinatario. Este campo es obligatorio y debe ser una cadena de texto.',
        example: 'Destinatario de prueba',
    })
    @IsString()
    nombre: string;

}