import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateResponsibleAreaDto {
    @ApiProperty({
        description: 'Nombre de la área responsable',
        example: 'Área de Marketing',
      })
    @IsString()
    nombre: string;
  
    @ApiProperty({
        description: 'Procedencia del responsable (opcional)',
        example: 'Oficina Central',  // Ejemplo de una procedencia
        required: false,  // Esto es opcional, ya que @IsOptional() lo marca
      })
    @IsString()
    @IsOptional()
    procedencia?: string;
  
    @ApiProperty({
        description: 'ID del usuario que creó el registro (opcional)',
        example: 123,  // Ejemplo de ID de creador
        required: false,
      })
    @IsNumber()
    @IsOptional()
    creadoPorId?: number;
}
