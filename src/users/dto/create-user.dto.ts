import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, IsStrongPassword } from 'class-validator';
export class CreateUserDto {

    @ApiProperty({
        description: 'El nombre del usuario. Este campo es obligatorio y debe ser una cadena de texto.',
        example: 'Juan',
    })
    @IsString()
    readonly nombre: string;
  
    @ApiProperty({
        description: 'El correo electrónico del usuario. Este campo es obligatorio y debe ser un correo electrónico válido.',
        example: 'juan@example.com',
    })
    @IsEmail()
    readonly email: string;

    @ApiProperty({
        description: 'La contraseña del usuario. Este campo es obligatorio y debe cumplir con las siguientes reglas: mínimo de 5 caracteres, al menos una letra minúscula, un número y un símbolo.',
        example: 'Password123!',
    })
    @IsNotEmpty()
    @IsStrongPassword({
        minLength: 5,        // Mínimo de 5 caracteres
        minLowercase: 1,     // Al menos una letra minúscula
        minNumbers: 1,       // Al menos un número
        minSymbols: 1,       // Al menos un símbolo
      })
    readonly contraseña: string;
  
    @ApiProperty({
        description: 'Los apellidos del usuario. Este campo es opcional y debe ser una cadena de texto.',
        example: 'Pérez',
        required: false,
    })
    @IsOptional()
    @IsString()
    readonly apellidos?: string;
  
    @ApiProperty({
        description: 'La procedencia del usuario. Este campo es opcional y debe ser una cadena de texto.',
        example: 'México',
        required: false,
    })
    @IsOptional()
    @IsString()
    readonly procedencia?: string;
  
    @ApiProperty({
        description: 'El tipo de usuario. Este campo es obligatorio y puede ser "admin" o "user".',
        example: 'admin',
        enum: ['admin', 'user'],
    })
    @IsEnum(['admin', 'user'])
    readonly tipoUsuario: string;
  
    @ApiProperty({
        description: 'Indica si el usuario es jefe. Este campo es obligatorio y puede ser "si" o "no".',
        example: 'si',
        enum: ['si', 'no']
    })
    @IsIn(['si', 'no'])
    readonly jefe: string;
  
    @ApiProperty({
        description: 'El ID del área a la que pertenece el usuario. Este campo es opcional y debe ser un número entero.',
        example: 2,
        required: false,
    })
    @IsOptional()
    @IsInt()
    readonly areaId?: number;
  
    @ApiProperty({
        description: 'El ID de la subárea a la que pertenece el usuario. Este campo es opcional y debe ser un número entero.',
        example: 3,
        required: false,
    })
    @IsOptional()
    @IsInt()
    readonly subAreaId?: number;
  
    @ApiProperty({
        description: 'El ID del rol asignado al usuario. Este campo es obligatorio y debe ser un número entero.',
        example: 1,
    })
    @IsInt()
    readonly rolId: number;

}
