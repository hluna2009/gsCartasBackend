import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ReopenCardDto {
  @ApiPropertyOptional({
    description: 'Motivo de reapertura (opcional)',
    example: 'La carta fue reabierta por un error en la aplicación...',
  })
  @IsOptional()
  @IsString()
  motivo?: string;
}
