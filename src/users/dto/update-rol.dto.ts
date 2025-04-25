import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateRolDto {
  @ApiProperty({
    description: 'El nombre del rol',
    example: 'Editor',  
    required: false,  
  })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiProperty({
    description: 'ID del usuario que actualizó el rol (opcional)',
    example: 12345,  
    required: false,
  })
  @IsOptional()
  @IsNumber()
  creadoPorId?: bigint;
}
