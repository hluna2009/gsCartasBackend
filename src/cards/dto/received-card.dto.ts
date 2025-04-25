import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class ReceivedCardDto {
  @ApiProperty({
    description: 'Información del PDF subido',
    example: 'ruta/al/archivo.pdf',
  })
  @IsString()
  pdfInfo: string;

  @ApiProperty({
    description: 'Código recibido de la carta',
    example: 'ABC123',
  })
  @IsString()
  codigoRecibido: string;

  @ApiProperty({
    description: 'Destinatario de la carta',
    example: 'Juan Pérez',
  })
  @IsString()
  destinatario: string;

  @ApiProperty({
    description: 'Asunto de la carta',
    example: 'Solicitud de información',
  })
  @IsString()
  asunto: string;

  @ApiProperty({
    description: 'Indica si la carta es confidencial',
    example: true,
  })
  @IsBoolean()
  esConfidencial: boolean;

  @ApiProperty({ description: 'ID del área responsable de la carta', required: false })
  @IsOptional()
  areaResponsableId?: bigint;

  @ApiProperty({ description: 'ID de la subárea de la carta', required: false })
  @IsOptional()
  subAreaId?: bigint;

  @ApiProperty({ description: 'ID de la empresa de la carta', required: false })
  @IsOptional()
  empresaId?: bigint;

  @ApiProperty({ description: 'ID del tema relacionado con la carta', required: false })
  @IsOptional()
  temaId?: bigint;

  @ApiProperty({ description: 'Correos en copia de la carta', type: [String], default: [] })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  correosCopia: string[];

  @ApiProperty({ description: 'Resumen recibido de la carta', required: false })
  @IsOptional()
  @IsString()
  resumenRecibido?: string;

  @ApiProperty({ description: 'Nivel Impacto de la carta', required: false })
  @IsOptional()
  @IsString()
  nivelImpacto?: string;

  @ApiProperty({ description: 'Referencia a la carta anterior (opcional)', required: false })
  @IsOptional()
  @IsNumber()
  referencia?: number; // Cambia a `number` si estás usando `BigInt` en el frontend o backend

  @ApiProperty({
    description: 'Fecha de ingreso de la carta',
    example: '03-02-2024'
  })
  @Transform(({ value }) => new Date(value)) // Convierte el string a Date
  @IsDate()
  @Type(() => Date)
  fechaIngreso: Date;

  @ApiProperty({ description: 'Indica si la carta tiene vencimiento', default: false })
  @IsBoolean()
  vencimiento: boolean;

  @ApiProperty({
    description: 'Fecha de vencimiento de la carta',
    required: false
  })
  @IsOptional()
  @Transform(({ value }) => new Date(value)) // Convierte el string a Date
  @IsDate()
  @Type(() => Date)
  fechadevencimiento?: Date;

  @ApiProperty({ description: 'Indica si la carta es informativa', default: false })
  @IsBoolean()
  informativo: boolean;

  @ApiProperty({ description: 'Indica si la carta es urgente', default: false })
  @IsBoolean()
  urgente: boolean;
}