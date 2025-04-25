import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión del usuario' })
  @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales incorrectas' })
  @ApiBody({ type: LoginUserDto})
  async login(@Body() loginuserDto:LoginUserDto){
    return this.authService.login(loginuserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Obtener perfil por el Token'})
  @ApiResponse({ status: 200, description: 'Perfil correcto'})
  async profile(@Request() req){
    return this.authService.getProfile(req.user.id);
  }
}
