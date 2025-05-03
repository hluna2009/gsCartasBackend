import { Transform, Type } from "class-transformer";
import { IsNumber, IsObject, IsOptional, IsString, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class PaginationDto {
    @ApiPropertyOptional({ description: "Número de página", minimum: 1, example: 1 })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @ApiPropertyOptional({ description: "Cantidad de elementos por página", minimum: 1, example: 10 })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    limit?: number = 10;
  
    @ApiPropertyOptional({ description: "Texto de búsqueda", example: "example" })
    @IsOptional()
    @IsString()
    search?: string;
  
    @ApiPropertyOptional({ 
        description: "Columnas por las que se va buscar", 
        type: [String], 
        example: ["name", "email"] 
    })
    @IsOptional()
    @IsString({ each: true })
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    searchBy?: string[];

    @ApiPropertyOptional({ 
        description: "Filtros aplicados a la consulta en formato JSON", 
        type: Object, 
        example: { status: "active", role: "admin" }
    })
    @IsOptional()
    @IsObject()
    @Transform(({ value }) => {
        try {
            return typeof value === 'string' ? JSON.parse(value) : value;
        } catch {
            return {};
        }
    })
    filters?: Record<string, string>;
}