import { Module } from '@nestjs/common';
import { UsersService } from './services/users/users.service';
import { UsersController } from './controllers/users/users.controller';
import { RolesService } from './services/roles/roles.service';
import { RolesController } from './controllers/roles/roles.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [UsersController, RolesController],
  providers: [UsersService, RolesService, PrismaService],
})
export class UsersModule {}
