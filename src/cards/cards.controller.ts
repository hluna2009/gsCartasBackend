import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReceivedCardDto } from './dto/received-card.dto';
import { AssignedCardDto } from './dto/assigned-card.dto';
import { PendingCardDto } from './dto/pending-card.dto';
import { AssignmentCardDto } from './dto/assignment-card.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva Carta' })
  @ApiResponse({ status: 201, description: 'Carta creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta' })
  create(@Body() createCardDto: CreateCardDto) {
    return this.cardsService.create(createCardDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las Cartas' })
  @ApiResponse({ status: 200, description: 'Cartas obtenidas exitosamente' })
  @ApiResponse({ status: 404, description: 'No se encontraron Cartas' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.cardsService.findAll(paginationDto);
  }

  @Get('report/:id')
  @ApiOperation({ summary: 'Obtener trazabilidad de una carta' })
  @ApiResponse({ status: 200, description: 'Cartas obtenidas exitosamente' })
  @ApiResponse({ status: 404, description: 'No se encontraron Cartas' })
  reportCards(@Param('id') id:string) {
    const idBigInt = BigInt(id)
    return this.cardsService.reportsCards(idBigInt);
  }

  @Get('emitidos')
  @ApiOperation({ summary: 'Obtener todas las Cartas Emitidas' })
  @ApiResponse({ status: 200, description: 'Cartas obtenidas exitosamente' })
  @ApiResponse({ status: 404, description: 'No se encontraron Cartas' })
  findAllEmision() {
    return this.cardsService.findAllEmision();
  }

  @Get('stats/:userId')
  @ApiOperation({ summary: 'Obtener las cantidades' })
  @ApiResponse({ status: 200, description: 'Cantidades obtenidas correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontraron cantidades' })
  findStats(@Param('userId') userId:string ){
    const idBigInt = BigInt(userId)
    return this.cardsService.findStats(idBigInt)
  } 

  @Get('pending/:subareaId')
  @ApiOperation({ summary: 'Obtener todas las Cartas Emitidas' })
  @ApiResponse({ status: 200, description: 'Cartas obtenidas exitosamente' })
  @ApiResponse({ status: 404, description: 'No se encontraron Cartas' })
  findAllPendientes(@Param('subareaId') subareaId: string, @Query() paginationDto: PaginationDto ) {
    return this.cardsService.findAllPendientes(+subareaId, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una Carta por ID' })
  @ApiResponse({ status: 200, description: 'Carta obtenida exitosamente' })
  @ApiResponse({ status: 404, description: 'Carta no encontrada' })
  findOne(@Param('id') id: string) {
    return this.cardsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una Carta existente' })
  @ApiResponse({ status: 200, description: 'Carta actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Carta no encontrada' })
  update(@Param('id') id: string, @Body() updateCardDto: UpdateCardDto) {
    return this.cardsService.update(+id, updateCardDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una Carta por ID' })
  @ApiResponse({ status: 200, description: 'Carta eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Carta no encontrada' })
  remove(@Param('id') id: string) {
    return this.cardsService.remove(+id);
  }


  @Post('received')
  @ApiOperation({ summary: 'Crear una carta recibida' })
  @ApiBody({ type: ReceivedCardDto })
  @ApiResponse({ status: 201, description: 'Carta creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async createReceivedCard(@Body() receivedCardDto: ReceivedCardDto ){
    return this.cardsService.createReceivedCard(receivedCardDto)
  }

  @Patch('assigned/:id')
  @ApiOperation({ summary: 'Asignar una Carta existente' })
  @ApiBody({ type: AssignedCardDto })
  @ApiResponse({ status: 200, description: 'Carta actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Carta no encontrada' })
  async assignedCard(@Param('id') id: string, @Body() assignedCardDto: AssignedCardDto ){
    return this.cardsService.assignedCard(+id, assignedCardDto)
  }

  @Patch('pending/:id')
  @ApiOperation({ summary: 'Cerrar pendiente una Carta existente' })
  @ApiBody({ type: PendingCardDto })
  @ApiResponse({ status: 200, description: 'Carta actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Carta no encontrada' })
  async pendingCard(@Param('id') id: string, @Body() pendingCardDto: PendingCardDto ){
    return this.cardsService.pendingCard(+id, pendingCardDto)
  }

  @Post('sendMail/:id')
  @ApiOperation({ summary: 'Enviar email pendiente una Carta existente' })
  @ApiBody({ type: PendingCardDto })
  @ApiResponse({ status: 200, description: 'Carta enviada exitosamente' })
  @ApiResponse({ status: 404, description: 'Carta no encontrada' })
  async sendMail(@Param('id') id: string ){
    return this.cardsService.sendMail(+id)
  }

  @Patch('assignment/:id')
  @ApiOperation({ summary: 'Cargo de una Carta existente' })
  @ApiBody({ type: AssignmentCardDto })
  @ApiResponse({ status: 200, description: 'Carta actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Carta no encontrada' })
  async assignmentCard(@Param('id') id: string, @Body() assignmentCardDto: AssignmentCardDto ){
    return this.cardsService.assignmentCard(+id, assignmentCardDto)
  }
}
