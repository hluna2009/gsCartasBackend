import { Module } from '@nestjs/common';
//import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { CardsModule } from './cards/cards.module';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './company/company.module';
import { ThemeModule } from './theme/theme.module';
import { ResponsibleAreaModule } from './responsible-area/responsible-area.module';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { FileuploadModule } from './fileupload/fileupload.module';
import { ReceiverModule } from './receiver/receiver.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule, 
    UsersModule, 
    CardsModule, 
    CompanyModule, 
    ThemeModule, 
    ResponsibleAreaModule, 
    MailModule, 
    ConfigModule.forRoot({isGlobal: true}), 
    FileuploadModule, 
    ReceiverModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
