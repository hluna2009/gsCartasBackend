import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MailService } from './mail.service';
import { SendMailDto } from './dto/send-mail.dto';
import { UrgentMailDto } from './dto/urgent-mail.dto';

@Controller('mail')
export class MailController {
  constructor(
    private readonly mailService: MailService
  ) {}

  @Post('send')
  async sendEmail(@Body() sendMailDto: SendMailDto ){
    console.log("data", sendMailDto);
    
    await this.mailService.sendUserConfirmation(sendMailDto);
  }

  
  @Post('urgent')
  async sendUrgentNotification(@Body() sendUrgentNotification:UrgentMailDto){
    await this.mailService.sendUrgentNotificaciont(sendUrgentNotification)
  } 
} 

