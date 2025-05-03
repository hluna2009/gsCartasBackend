import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Min, MinLength, ValidateIf } from 'class-validator';

export class PendingCardDto {
  @ApiPropertyOptional({
    description: 'Borrador de la respuesta a la carta (opcional)',
    example: 'Respuesta a la carta...',
  })
  @IsOptional()
  @IsString()
  cartaborrador?: string;

  @ApiPropertyOptional({
    description: 'Comentario adicional (opcional)',
    example: 'Comentario sobre la respuesta...',
  })
  @IsOptional()
  @IsString()
  @MinLength(10, {message: 'El comentario debe tener al menos 10 caracteres.' })
  @ValidateIf(o => o.devuelto === false) // Solo se valida si devuelto es false
  comentario?: string;

  @ApiPropertyOptional({
    description: 'Indica si la carta ha sido devuelta (opcional)',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  devuelto?: boolean;

  @ApiPropertyOptional({
    description: 'Observaciones si la carta se devuelve (opcional)',
    example: 'La carta se devuelve por falta de información...',
  })
  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Las observaciones deben tener al menos 10 caracteres.' })
  @ValidateIf(o => o.devuelto === true) // Solo se valida si devuelto es true
  observaciones?: string;
}