import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateSubAreaDto {
    @ApiProperty({
        description: 'Nombre de la subárea',
        example: 'Subárea de Desarrollo',
      })
    @IsString()
    nombre: string;
  
    @ApiProperty({
        description: 'ID del área responsable a la que pertenece esta subárea',
        example: 1,  // Suponiendo que el área responsable tiene ID 1
      })
    @IsNumber()
    areaResponsableId: number;
  
    @ApiProperty({
        description: 'Procedencia de la subárea (opcional)',
        example: 'Oficina de Bogotá',
        required: false,
      })
    @IsString()
    @IsOptional()
    procedencia?: string;
  
    @ApiProperty({
        description: 'Jefatura de la subárea (opcional)',
        example: 'Jefe de Desarrollo',
        required: false,
      })
    @IsString()
    @IsOptional()
    jefatura?: string;
 
    @ApiProperty({
        description: 'ID del usuario que creó la subárea (opcional)',
        example: 123,  // ID de usuario que creó la subárea
        required: false,
      })
    @IsNumber()
    @IsOptional()
    creadoPorId?: number;
}
