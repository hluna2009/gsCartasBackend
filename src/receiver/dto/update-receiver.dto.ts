import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateReceiverDto } from './create-receiver.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateReceiverDto extends PartialType(CreateReceiverDto) {
        @ApiProperty({
            description: 'El tipo de documento. Este campo es obligatorio y debe ser una cadena de texto.',
            example: 'DNI',
        })
        @IsOptional()
        @IsString()
        tipodoc: string;
    
        @ApiProperty({
            description: 'El número de doc. Este campo es obligatorio y debe ser una cadena de texto.',
            example: '876543299',
        })
        @IsOptional()
        @IsString()
        numdoc: string;
    
        @ApiProperty({
            description: 'El nombre del destinatario. Este campo es obligatorio y debe ser una cadena de texto.',
            example: 'Destinatario de prueba',
        })
        @IsOptional()
        @IsString()
        nombre: string;
}
