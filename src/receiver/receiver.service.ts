import { Injectable } from '@nestjs/common';
import { CreateReceiverDto } from './dto/create-receiver.dto';
import { UpdateReceiverDto } from './dto/update-receiver.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReceiverService {
  constructor( private prisma : PrismaService ){}
  create(createReceiverDto: CreateReceiverDto) {
    return this.prisma.destinatario.create({
      data: createReceiverDto
    });
  }

  findAll() {
    return this.prisma.destinatario.findMany();
  }

  findOne(id: number) {
    return this.prisma.destinatario.findUnique({
      where: { id }
    });
  }

  update(id: number, updateReceiverDto: UpdateReceiverDto) {
    return this.prisma.destinatario.update({
      where: { id },
      data: updateReceiverDto
    });
  }

  remove(id: number) {
    return this.prisma.destinatario.delete({
      where: { id }
    });
  }
}
