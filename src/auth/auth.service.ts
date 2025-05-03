import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}


  async login(loginuserDto: LoginUserDto){
    const user = await this.prisma.usuario.findUnique({
      where: {
        email: loginuserDto.email
      }
    });

    console.log("que fue del user", user);
    

    if(!user || !(await bcrypt.compare(loginuserDto.contraseña, user.contraseña))){
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { email: user.email, sub: user.id.toString() };

    console.log("payload", payload);
    
    const access_token = this.jwtService.sign(payload);
    
    return {
      access_token,
      userId: user.id
    }
  }

  async getProfile(userId: number){
    return this.prisma.usuario.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        subAreaId: true,
        rol: {
          select: {
            nombre: true
          }
        }
      }
    });
  }

  // async ldapLogin(email: string, password: string) {
  //   const ldapUser = await this.ldapAuthenticate(email, password);

  //   if (!ldapUser) {
  //     throw new UnauthorizedException('Autenticación LDAP fallida');
  //   }

  //   // Buscar en la base de datos por email
  //   const user = await this.prisma.usuario.findUnique({
  //     where: { email }
  //   });

  //   if (!user) {
  //     throw new UnauthorizedException('Usuario no registrado en el sistema');
  //   }

  //   return this.generateToken(user);
  // }
}
