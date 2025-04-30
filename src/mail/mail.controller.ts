import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
} from '@nestjs/common';
import { MailService } from './mail.service';
import { SendMailDto } from './dto/send-mail.dto';
import { UrgentMailDto } from './dto/urgent-mail.dto';
import { Response } from 'express';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  async sendEmail(@Body() sendMailDto: SendMailDto) {
    console.log('data', sendMailDto);

    await this.mailService.sendUserConfirmation(sendMailDto);
  }

  @Post('urgent')
  async sendUrgentNotification(@Body() sendUrgentNotification: UrgentMailDto) {
    await this.mailService.sendUrgentNotificaciont(sendUrgentNotification);
  }

  @Get('/preview/:template')
  renderTemplate(@Param('template') template: string, @Res() res: Response) {
    const carta = {
      asunto: 'ejemplo',
      estado: 'Ingresado',
      fechaIngreso: '2025-04-28',
      resumenRecibido: 'asdasd',
      urgente: false,
    };
    return res.render(template, {
      message: 'Hola Elvis, tienes una carta urgente que atender',
      link: 'https://www.gruposur.com/portal',
      asunto: carta.asunto,
      estado: carta.estado,
      fechaIngreso: carta.fechaIngreso,
      resumenRecibido: carta.resumenRecibido,
      urgente: carta.urgente,
      year: new Date().getFullYear(),
    });
  }
}
