import { Injectable, UnauthorizedException } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport";
import Strategy from "passport-ldapauth";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class LdapStrategy extends PassportStrategy(Strategy, 'ldap'){

    constructor(configService: ConfigService){
        super({
            server: {
              url: configService.get('LDAP_URL'),  // URL del servidor AD
              bindDN: configService.get('LDAP_BIND_DN'), // Usuario de bind
              bindCredentials: configService.get('LDAP_BIND_PASSWORD'), // Contraseña del usuario bind
              searchBase: configService.get('LDAP_SEARCH_BASE'), // Base de búsqueda en AD
              searchFilter: '(sAMAccountName={{username}})', // Filtro para buscar el usuario
              tlsOptions: { rejectUnauthorized: false } // Si AD usa SSL, desactivar validación de certificados
            }
          });
    }

    async validate(user: any) {
      if (!user) {
        throw new UnauthorizedException('Credenciales LDAP inválidas');
      }
      console.log("dame el usuario", user);
      
      return {
        username: user.sAMAccountName,
        email: user.mail,
        name: user.cn,
      };
    }
}