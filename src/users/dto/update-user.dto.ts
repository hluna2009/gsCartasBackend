import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsEnum, IsIn, IsInt, IsOptional, IsString, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiProperty({
        description: 'El nombre del usuario. Este campo es opcional para la actualización y debe ser una cadena de texto.',
        example: 'Juan',
        required: false,
    })
    @IsOptional()
    @IsString()
    readonly nombre?: string;

    @ApiProperty({
        description: 'El correo electrónico del usuario. Este campo es opcional para la actualización y debe ser un correo electrónico válido.',
        example: 'juan@example.com',
        required: false,
    })
    @IsOptional()
    @IsEmail()
    readonly email?: string;

    @ApiProperty({
        description: 'La contraseña del usuario. Este campo es opcional para la actualización, pero debe cumplir con las reglas de seguridad si se proporciona.',
        example: 'Password123!',
        required: false,
    })
    @IsOptional()
    @IsStrongPassword({
        minLength: 5,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    })
    readonly contraseña?: string;

    @ApiProperty({
        description: 'Los apellidos del usuario. Este campo es opcional para la actualización y debe ser una cadena de texto.',
        example: 'Pérez',
        required: false,
    })
    @IsOptional()
    @IsString()
    readonly apellidos?: string;

    @ApiProperty({
        description: 'La procedencia del usuario. Este campo es opcional para la actualización y debe ser una cadena de texto.',
        example: 'México',
        required: false,
    })
    @IsOptional()
    @IsString()
    readonly procedencia?: string;

    @ApiProperty({
        description: 'El tipo de usuario. Este campo es opcional para la actualización y puede ser "admin" o "user".',
        example: 'admin',
        required: false,
        enum: ['admin', 'user']
    })
    @IsOptional()
    @IsEnum(['admin', 'user'])
    readonly tipoUsuario?: string;

    @ApiProperty({
        description: 'Indica si el usuario es jefe. Este campo es opcional para la actualización y puede ser "si" o "no".',
        example: 'si',
        required: false,
        enum: ['si', 'no']
    })
    @IsOptional()
    @IsIn(['si', 'no'])
    readonly jefe?: string;

    @ApiProperty({
        description: 'El ID del área a la que pertenece el usuario. Este campo es opcional para la actualización y debe ser un número entero.',
        example: 2,
        required: false,
    })
    @IsOptional()
    @IsInt()
    readonly areaId?: number;

    @ApiProperty({
        description: 'El ID de la subárea a la que pertenece el usuario. Este campo es opcional para la actualización y debe ser un número entero.',
        example: 3,
        required: false,
    })
    @IsOptional()
    @IsInt()
    readonly subAreaId?: number;

    @ApiProperty({
        description: 'El ID del rol asignado al usuario. Este campo es obligatorio para la actualización y debe ser un número entero.',
        example: 1,
    })
    @IsInt()
    readonly rolId: number;
}