import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReceiverService } from './receiver.service';
import { CreateReceiverDto } from './dto/create-receiver.dto';
import { UpdateReceiverDto } from './dto/update-receiver.dto';

@Controller('receiver')
export class ReceiverController {
  constructor(private readonly receiverService: ReceiverService) {}

  @Post()
  create(@Body() createReceiverDto: CreateReceiverDto) {
    return this.receiverService.create(createReceiverDto);
  }

  @Get()
  findAll() {
    return this.receiverService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.receiverService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReceiverDto: UpdateReceiverDto) {
    return this.receiverService.update(+id, updateReceiverDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.receiverService.remove(+id);
  }
}
