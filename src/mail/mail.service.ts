import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { SendMailDto } from './dto/send-mail.dto';
import { NotiMailDto } from './dto/noti-mail.dto';
import { UrgentMailDto } from './dto/urgent-mail.dto';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: SendMailDto) {
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
    console.log(
      `se esta enviando ${cartasPendientes.length} cartas a ${email.email}`,
    );
    const cartasParaTemplate = cartasPendientes.map((carta) => ({
      id: carta.id,
      asunto: carta?.asunto || 'Sin asunto',
      codigoRecibido: carta.codigoRecibido,
      para: carta?.Destinatario.nombre || 'Sin Destinatario',
      de: carta?.empresa.nombre || 'Sin Empresa',
      resumenRecibido: carta.resumenRecibido || 'Resumen no especificado',

      subArea: carta?.subArea.nombre || 'Sin Subarea',
      informativo: carta?.informativo ? 'No' : 'Si',

      fechaIngreso: carta.fechaIngreso
        ? new Date(carta.fechaIngreso).toLocaleDateString()
        : 'No especificada',
      diasPendiente: carta.fechaIngreso
        ? Math.floor(
            (new Date().getTime() - new Date(carta.fechaIngreso).getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : 'N/A',
      archivosAdjuntos:
        carta.archivosAdjuntos.length > 0
          ? carta.archivosAdjuntos.map(
              (e) => `${process.env.HOST_API_FILE}/${e}`,
            )
          : null,
      pdfInfo: carta.pdfInfo
        ? `${process.env.HOST_API_FILE}/${carta.pdfInfo}`
        : null,
    }));

    const mailOptions = {
      to: email.email,
      subject:
        cartasPendientes.length > 1
          ? `TIENES ${cartasPendientes.length} CARTAS PENDIENTES`
          : 'TIENES UNA CARTA PENDIENTE',
      template: './notification_email',
      context: {
        nombre: email.nombre,
        totalCartas: cartasPendientes.length,
        cartas: cartasParaTemplate,
        link: `${process.env.HOST_API}`,
        fechaActual: new Date().toLocaleDateString(),
        year: '2025',
      },
    };

    // Solo incluir "cc" si hay correos en el arreglo
    if (email.cc && email.cc.length > 0) {
      mailOptions['cc'] = email.cc;
    }

    try {
      await this.mailerService.sendMail(mailOptions);
      this.logger.log(
        `Correo enviado correctamente a ${email.email} con ${cartasPendientes.length} cartas`,
      );
    } catch (error) {
      this.logger.error(
        `Error al enviar correo a ${email.email}: ${error.message}`,
      );
    }
  }

  async sendRegistrosDiarios(email: any, cartas: any[]) {
    const {
      nombre,
      email: emailTo,
      asunto,
      fechaIngreso = new Date(),
      resumenRecibido,
    } = email;

    const cartasParaTemplate = cartas.map((carta) => ({
      id: carta.id,
      codigoRecibido: carta.codigoRecibido,
      de: carta?.empresa.nombre || 'Sin Empresa',
      asunto: carta?.asunto || 'Sin asunto',
      resumenRecibido: carta.resumenRecibido || 'Resumen no especificado',
      subArea: carta?.subArea.nombre || 'Sin Subarea',

      informativo: carta?.informativo ? 'No' : 'Si',
      fechaIngreso: carta.fechaIngreso
        ? new Date(carta.fechaIngreso).toLocaleDateString()
        : 'No especificada',

      para: carta?.Destinatario.nombre || 'Sin Destinatario',
      diasPendiente: carta.fechaIngreso
        ? Math.floor(
            (new Date().getTime() - new Date(carta.fechaIngreso).getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : 'N/A',
      archivosAdjuntos:
        carta.archivosAdjuntos.length > 0
          ? carta.archivosAdjuntos.map(
              (e) => `${process.env.HOST_API_FILE}/${e}`,
            )
          : null,
      pdfInfo: carta.pdfInfo
        ? `${process.env.HOST_API_FILE}/${carta.pdfInfo}`
        : null,
    }));

    const mailOptions = {
      to: emailTo,
      subject: `CARTAS DIARIAS ${fechaIngreso.toLocaleDateString()}`,
      template: './registrosDiarios',
      context: {
        nombre,
        totalCartas: cartas.length,
        cartas: cartasParaTemplate,
        link: `${process.env.HOST_API}`,
        fechaActual: new Date().toLocaleDateString(),
        year: '2025',
      },
    };

    try {
      await this.mailerService.sendMail(mailOptions);
      this.logger.log(
        `Correo enviado correctamente a ${emailTo} con ${cartas.length} cartas`,
      );
    } catch (error) {
      this.logger.error(
        `Error al enviar correo a ${emailTo}: ${error.message}`,
      );
    }
  }
  async sendUrgentNotificaciont({
    cc,
    email,
    nombre,
    priority,
    asunto,
    fechaIngreso,
    resumenRecibido,
    urgente,
    estado,
    pdfInfo,
    archivosAdjuntos,
  }: UrgentMailDto) {
    const mailOptions = {
      to: email,
      subject: 'Urgente portal de Cartas',
      template: './urgent',
      context: {
        message: `Hola ${nombre}, tienes una carta urgente que atender`,
        link: `${process.env.HOST_API}`,
        asunto,
        fechaIngreso,
        resumenRecibido,
        urgente,
        estado,
        archivosAdjuntos:
          archivosAdjuntos.length > 0
            ? archivosAdjuntos.map((e) => `${process.env.HOST_API_FILE}/${e}`)
            : null,
        pdfInfo: pdfInfo ? `${process.env.HOST_API_FILE}/${pdfInfo}` : null,
        year: new Date().getFullYear(),
      },
      headers: {
        // Marcar como urgente (Outlook y Gmail)
        'X-Priority': `${priority === 'ALTO' ? '1' : '2'}`, // 1 = Alta prioridad, 2 = Normal, 3 = Baja
        Importance: `${priority === 'ALTO' ? 'high' : 'normal'}`, // high = Alta prioridad
        'X-MSMail-Priority': `${priority === 'ALTO' ? 'High' : ''}`, // Para clientes de correo antiguos de Microsoft
      },
    };
    // Solo incluir "cc" si hay correos en el arreglo
    if (cc && cc.length > 0) {
      mailOptions['cc'] = cc;
    }
    try {
      await this.mailerService.sendMail(mailOptions);
      this.logger.log(`Correo enviado correctamente a ${email}`);
    } catch (error) {
      this.logger.error(`Error al enviar correo a ${email}: ${error.message}`);
    }
  }
}
