import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { SendMailDto } from './dto/send-mail.dto';
import { NotiMailDto } from './dto/noti-mail.dto';
import { UrgentMailDto } from './dto/urgent-mail.dto';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name)
   
  constructor(
    private mailerService: MailerService
  ) {}


  async sendUserConfirmation(user: SendMailDto ) {
    console.log("data serivces", user);
    
    const url = `https://www.youtube.com/channel/UCvXekawNgmVfd615D52nNow`;
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to Nice App!',
      template: './welcome',
      context: {
        nombre: user.nombre,
        url,
      },
    });
  }

  async sendNotification(email: NotiMailDto, cartasPendientes: any[] = []) {

    const cartasParaTemplate = cartasPendientes.map(carta => ({
      id: carta.id,
      asunto: carta.asunto || 'Sin asunto',
      resumenRecibido: carta.resumenRecibido || 'Resumen no especificado',
      fechaIngreso: carta.fechaIngreso ? new Date(carta.fechaIngreso).toLocaleDateString() : 'No especificada',
      diasPendiente: carta.fechaIngreso ? 
        Math.floor((new Date().getTime() - new Date(carta.fechaIngreso).getTime()) / (1000 * 60 * 60 * 24)) : 'N/A'
    }));
  
    this.logger.log('Llegamos aqui', cartasParaTemplate.length)
    const mailOptions = {
      to: email.email,
      subject: cartasPendientes.length > 1 ? 
        `TIENES ${cartasPendientes.length} CARTAS PENDIENTES` : 
        'TIENES UNA CARTA PENDIENTE',
      template: './notification_email',
      context: {
        nombre: email.nombre,
        totalCartas: cartasPendientes.length,
        cartas: cartasParaTemplate,
        link: `${process.env.HOST_API}`,
        fechaActual: new Date().toLocaleDateString(),
        year: '2025'
      },
    };
  
    // Solo incluir "cc" si hay correos en el arreglo
    if (email.cc && email.cc.length > 0) {
      mailOptions['cc'] = email.cc;
    }
  
    try {
      await this.mailerService.sendMail(mailOptions);
      this.logger.log(`Correo enviado correctamente a ${email.email} con ${cartasPendientes.length} cartas`);
    } catch (error) {
      this.logger.error(`Error al enviar correo a ${email.email}: ${error.message}`);
    }
  }

  async sendUrgentNotificaciont(email: UrgentMailDto){
    console.log('que datos llegan', email)
    const mailOptions = {
      to: email.email,
      subject: 'Urgente portal de Cartas',
      template: './urgent',
      context: {
        message: `Hola ${email.nombre}, tienes una carta urgente que atender`,
        link: `${process.env.HOST_API}`
      },
      headers: {
        // Marcar como urgente (Outlook y Gmail)
        'X-Priority': `${email.priority==='ALTO'?'1':'2'}`, // 1 = Alta prioridad, 2 = Normal, 3 = Baja
        'Importance': `${email.priority==='ALTO'?'high':'normal'}`, // high = Alta prioridad
        'X-MSMail-Priority': `${email.priority==='ALTO'?'High':''}`, // Para clientes de correo antiguos de Microsoft
      },
    };
    // Solo incluir "cc" si hay correos en el arreglo
    if (email.cc && email.cc.length > 0) {
      mailOptions['cc'] = email.cc;
    }
    try {
      await this.mailerService.sendMail(mailOptions);
      this.logger.log(`Correo enviado correctamente a ${email.email}`);
    } catch (error) {
      this.logger.error(`Error al enviar correo a ${email.email}: ${error.message}`);
      //throw error; // Opcional: relanzar el error si es necesario
    }
  }

}
