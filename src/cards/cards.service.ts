import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReceivedCardDto } from './dto/received-card.dto';
import { AssignedCardDto } from './dto/assigned-card.dto';
import { PendingCardDto } from './dto/pending-card.dto';
import { AssignmentCardDto } from './dto/assignment-card.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { MailService } from 'src/mail/mail.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { endOfWeek, startOfWeek, subHours } from 'date-fns';

@Injectable()
export class CardsService {
  private readonly logger = new Logger(CardsService.name);

  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  // @Cron(CronExpression.EVERY_DAY_AT_10AM)
  // async handleCron() {
  //   this.logger.debug(
  //     'Iniciando proceso de envío de correos para cartas pendientes',
  //   );
  //
  //   const today = new Date();
  //   const todayDateString = new Date(today.setHours(23, 59, 59, 999));
  //
  //   const newCards = await this.prisma.carta.findMany({
  //     where: {
  //       estado: 'Ingresado',
  //       fechaEnvio: null,
  //       fechaIngreso: {
  //         lte: todayDateString,
  //       },
  //     },
  //     include: {
  //       Destinatario: true,
  //       cartaAnterior: true,
  //       respuestas: true,
  //       areaResponsable: true,
  //       subArea: true,
  //       temaRelacion: true,
  //       empresa: true,
  //     },
  //   });
  //
  //   const cartasPorSubArea = new Map<bigint, { new: any[]; pending: any[] }>();
  //
  //   for (const carta of newCards) {
  //     if (!cartasPorSubArea.has(carta.subAreaId)) {
  //       cartasPorSubArea.set(carta.subAreaId, { new: [], pending: [] });
  //     }
  //     cartasPorSubArea.get(carta.subAreaId).new.push(carta);
  //   }
  //
  //   for (const [subAreaId, cartas] of cartasPorSubArea.entries()) {
  //     await this.processSubArea(subAreaId, cartas.new, cartas.pending);
  //   }
  // }
  //
  // @Cron(CronExpression.EVERY_10_SECONDS)
  async correoBienvenida() {
    this.logger.debug('Iniciando proceso de envío de correos de bienvenida');

    const usuarios = await this.prisma.usuario.findMany({
      where: {
        id: {
          in: [4],
        },
      },
      include: {
        subArea: true,
        area: true,
      },
    });

    const { default: pLimit } = await import('p-limit');
    const limit = pLimit(3);

    const tasks = usuarios.map((usuario) =>
      limit(async () => {
        try {
          await this.mail.sendWelcome(usuario);
          this.logger.log(`Correo enviado a ${usuario.email}`);
        } catch (err) {
          this.logger.error(
            `Error al enviar a ${usuario.email}: ${err.message}`,
          );
        }
      }),
    );

    await Promise.all(tasks);
  }

  // @Cron('55 23 * * 0')
  // async enviarResumenSemanal() {
  //   const hoy = new Date(); // ahora en UTC
  //   const inicioSemana = startOfWeek(hoy, { weekStartsOn: 1 }); // lunes 00:00
  //   const finSemana = endOfWeek(hoy, { weekStartsOn: 1 }); // domingo 23:59:59.999
  //
  //   this.logger.debug(
  //     `Enviando resumen semanal (${inicioSemana.toISOString()} – ${finSemana.toISOString()})`,
  //   );
  //
  //   const jefes = await this.prisma.usuario.findMany({
  //     where: { jefe: 'si' },
  //     include: {
  //       subArea: {
  //         // ← usa plural si la relación es 1‑N
  //         include: {
  //           cartas: {
  //             include: {
  //               Destinatario: true,
  //               cartaAnterior: true,
  //               respuestas: true,
  //               areaResponsable: true,
  //               subArea: true,
  //               temaRelacion: true,
  //               empresa: true,
  //             },
  //             where: {
  //               createdAt: {
  //                 gte: inicioSemana,
  //                 lte: finSemana,
  //               },
  //             },
  //           },
  //         },
  //       },
  //       area: true,
  //     },
  //   });
  //
  //   const { default: pLimit } = await import('p-limit');
  //   const limit = pLimit(3);
  //
  //   await Promise.all(
  //     jefes.map((jefe) =>
  //       limit(async () => {
  //         const cartasSemanales = jefe.subArea.cartas;
  //
  //         if (cartasSemanales.length === 0) {
  //           this.logger.debug(`Sin cartas para ${jefe.email} esta semana`);
  //           return;
  //         }
  //
  //         try {
  //           await this.mail.sendResumenSemanal(jefe, cartasSemanales);
  //           this.logger.log(`Resumen semanal enviado a ${jefe.email}`);
  //         } catch (err) {
  //           this.logger.error(
  //             `Error al enviar a ${jefe.email}: ${err.message}`,
  //           );
  //         }
  //       }),
  //     ),
  //   );
  // }
  //

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async prueba() {
    this.logger.debug('Iniciando prueba');
    this.mail.sendUserConfirmation({
      email: 'zuiersadien@gmail.com',
      nombre: 'Test',
    });

    const ahora = new Date();
    const hace24Horas = subHours(ahora, 24);

    const usuarios = await this.prisma.usuario.findMany({
      where: {
        areaId: { notIn: [17, 16, 1] },
        jefe: 'no',
      },
      include: {
        area: true,
        subArea: {
          include: {
            cartas: {
              where: { createdAt: { gte: hace24Horas, lte: ahora } },
              include: {
                Destinatario: true,
                cartaAnterior: true,
                respuestas: true,
                areaResponsable: true,
                subArea: true,
                temaRelacion: true,
                empresa: true,
              },
            },
          },
        },
      },
    });
    console.log(usuarios.length);
    const pLimit = (await import('p-limit')).default;
    const limit = pLimit(3);

    await Promise.all(
      usuarios.map((usuario) =>
        limit(async () => {
          const cartasUltimas24Horas = usuario.subArea?.cartas ?? [];

          console.log(cartasUltimas24Horas.length, usuario.nombre);

          if (cartasUltimas24Horas.length === 0) {
            this.logger.debug(`Sin cartas para ${usuario.nombre} esta semana`);
            return;
          }

          try {
            return;
            await this.mail.sendRegistrosDiarios(
              usuario,
              cartasUltimas24Horas,
              'subarea',
            );
            this.logger.log(`Correo enviado a ${usuario.email}`);
          } catch (err) {
            this.logger.error(
              `Error al enviar a ${usuario.email}: ${err.message}`,
            );
          }
        }),
      ),
    );
    return usuarios;
  }
  @Cron(CronExpression.EVERY_DAY_AT_10AM, {
    name: 'resumenCartas',
    timeZone: 'America/Lima',
  })
  async resumenCartasEstablecidas(): Promise<void> {
    this.logger.debug('Iniciando resumen de cartas establecidas');

    const areaIds = [17, 16, 1];
    const usuarios = await this.prisma.usuario.findMany({
      where: { areaId: { in: areaIds } },
      include: { subArea: true, area: true },
    });

    console.log(usuarios.length);

    const ahora = new Date();
    const hace24Horas = subHours(ahora, 24);

    const cartas = await this.prisma.carta.findMany({
      where: { createdAt: { gte: hace24Horas, lte: ahora } },
      include: {
        Destinatario: true,
        cartaAnterior: true,
        respuestas: true,
        areaResponsable: true,
        subArea: true,
        temaRelacion: true,
        empresa: true,
      },
    });

    if (!cartas.length) {
      this.logger.debug(
        'No hay cartas en las últimas 24 h; se omite el envío.',
      );
      return;
    }

    const pLimit = (await import('p-limit')).default;

    const limit = pLimit(3);
    await Promise.all(
      usuarios.map((usuario) =>
        limit(async () => {
          try {
            console.log(usuario.nombre, cartas.length);
            await this.mail.sendRegistrosDiarios(usuario, cartas, 'total');

            if (cartas.length === 0) {
              this.logger.debug(
                `Sin cartas para ${usuario.nombre} esta semana`,
              );
              return;
            }
            this.logger.log(`Correo enviado a ${usuario.email}`);
          } catch (err) {
            this.logger.error(
              `Error al enviar a ${usuario.email}: ${err.message}`,
            );
          }
        }),
      ),
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM, {
    name: 'enviosJefatura',
    timeZone: 'America/Lima',
  })
  async enviosDiariosPorJefatura() {
    this.logger.debug(`Iniciando envío de correos diarios por jefatura`);

    const ahora = new Date();
    const hace24Horas = subHours(ahora, 24);

    const usuarios = await this.prisma.usuario.findMany({
      where: {
        jefe: 'si',
        areaId: { notIn: [17, 16, 1] },
      },
      include: {
        area: {
          include: {
            cartas: {
              where: { createdAt: { gte: hace24Horas, lte: ahora } },
              include: {
                Destinatario: true,
                cartaAnterior: true,
                respuestas: true,
                areaResponsable: true,
                subArea: true,
                temaRelacion: true,
                empresa: true,
              },
            },
          },
        },
      },
    });
    console.log(usuarios.length);

    const pLimit = (await import('p-limit')).default;

    const limit = pLimit(3);

    await Promise.all(
      usuarios.map((usuario) =>
        limit(async () => {
          const cartasUltimas24Horas = usuario.area?.cartas ?? [];

          console.log(cartasUltimas24Horas.length, usuario.nombre);

          if (cartasUltimas24Horas.length === 0) {
            this.logger.debug(`Sin cartas para ${usuario.nombre} esta semana`);
            return;
          }
          try {
            await this.mail.sendRegistrosDiarios(
              usuario,
              cartasUltimas24Horas,
              'area',
            );
            this.logger.log(`Correo enviado a ${usuario.email}`);
          } catch (err) {
            this.logger.error(
              `Error al enviar a ${usuario.email}: ${err.message}`,
            );
          }
        }),
      ),
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM, {
    name: 'enviosSubArea',
    timeZone: 'America/Lima',
  })
  async enviarCorreoRegistrosDiariosPorSubArea(): Promise<void> {
    this.logger.debug('Iniciando envío de registros diarios por sub‑área');

    const ahora = new Date();
    const hace24Horas = subHours(ahora, 24);

    const usuarios = await this.prisma.usuario.findMany({
      where: {
        areaId: { notIn: [17, 16, 1] },
        jefe: 'no',
      },
      include: {
        area: true,
        subArea: {
          include: {
            cartas: {
              where: { createdAt: { gte: hace24Horas, lte: ahora } },
              include: {
                Destinatario: true,
                cartaAnterior: true,
                respuestas: true,
                areaResponsable: true,
                subArea: true,
                temaRelacion: true,
                empresa: true,
              },
            },
          },
        },
      },
    });
    console.log(usuarios.length);

    const pLimit = (await import('p-limit')).default;
    const limit = pLimit(3);

    await Promise.all(
      usuarios.map((usuario) =>
        limit(async () => {
          const cartasUltimas24Horas = usuario.subArea?.cartas ?? [];

          console.log(cartasUltimas24Horas.length, usuario.nombre);

          if (cartasUltimas24Horas.length === 0) {
            this.logger.debug(`Sin cartas para ${usuario.nombre} esta semana`);
            return;
          }

          try {
            await this.mail.sendRegistrosDiarios(
              usuario,
              cartasUltimas24Horas,
              'subarea',
            );
            this.logger.log(`Correo enviado a ${usuario.email}`);
          } catch (err) {
            this.logger.error(
              `Error al enviar a ${usuario.email}: ${err.message}`,
            );
          }
        }),
      ),
    );
  }

  private async processSubArea(
    subAreaId: bigint,
    newCards: any[],
    pendingCards: any[],
  ) {
    const usuarios = await this.prisma.usuario.findMany({
      where: { subAreaId },
    });

    if (usuarios.length === 0) {
      this.logger.warn(`Subárea ${subAreaId} no tiene usuarios asignados`);
      return;
    }

    const allCards = [...newCards, ...pendingCards];

    if (allCards.length === 0) {
      return;
    }

    const gruposCC = new Map<string, any[]>();

    for (const carta of allCards) {
      const ccNormalizados = Array.from(new Set(carta.correosCopia || []))
        .sort()
        .join(';');

      if (!gruposCC.has(ccNormalizados)) {
        gruposCC.set(ccNormalizados, []);
      }

      gruposCC.get(ccNormalizados).push(carta);
    }

    const { default: pLimit } = await import('p-limit');
    const limit = pLimit(3);

    const tasks = usuarios.flatMap((usuario) =>
      Array.from(gruposCC.entries()).map(([ccKey, cartas]) =>
        limit(async () => {
          const ccList = ccKey.split(';').filter(Boolean);
          const email = {
            email: usuario.email,
            nombre: usuario.nombre,
            cc: ccList,
          };
          await this.mail.sendNotification(email, cartas);
        }),
      ),
    );

    await Promise.all(tasks);
    // await Promise.all(
    //   usuarios.map((usuario) =>
    //     Promise.all(
    //       Array.from(gruposCC.entries()).map(async ([ccKey, cartas]) => {
    //         const ccList = ccKey.split(';').filter(Boolean);
    //
    //         const email = {
    //           email: usuario.email,
    //           nombre: usuario.nombre,
    //           cc: ccList,
    //         };
    //
    //         try {
    //           await this.mail.sendNotification(email, cartas);
    //           // this.logger.log(
    //           //   `Correo enviado a ${usuario.email} con ${cartas.length} cartas ` +
    //           //     `(CC: ${ccList.length > 0 ? ccList.join(', ') : 'ninguno'})`,
    //           // );
    //         } catch (error) {
    //           this.logger.error(
    //             `Error al enviar correo a ${usuario.email}: ${error.message}`,
    //           );
    //         }
    //       }),
    //     ),
    //   ),
    // );
  }
  async create(createCardDto: CreateCardDto) {
    const { referencia, archivosAdjuntos, ...rest } = createCardDto;

    if (referencia) {
      const cartaAnterior = await this.prisma.carta.findUnique({
        where: { id: referencia },
      });

      if (!cartaAnterior) {
        throw new NotFoundException('La carta anterior no existe');
      }
    }

    return this.prisma.carta.create({
      data: {
        ...rest,
        referencia,
      },
    });
  }

  async findAllReport() {
    let where: Prisma.CartaWhereInput = {};
    const data = await this.prisma.carta.findMany({
      where,
      orderBy: { id: 'desc' },
      include: {
        Destinatario: true,
        cartaAnterior: true,
        respuestas: true,
        areaResponsable: true,
        subArea: true,
        temaRelacion: true,
        empresa: true,
      },
    });
    const datesFormated = data.map((carta) => ({
      ...carta,
      fechaIngreso: carta.fechaIngreso?.toISOString().split('T')[0],
      fechaEnvio: carta.fechaEnvio?.toISOString().split('T')[0],
      fechadevencimiento: carta.fechadevencimiento?.toISOString().split('T')[0],
    }));

    return { data: datesFormated, meta: { total: data.length } };
  }
  async findAll(paginationDto: PaginationDto) {
    const { page, limit, search, searchBy, filters } = paginationDto;

    let where = {};

    const data = await this.prisma.carta.findMany({
      where: {
        estado: {
          not: {
            in: ['Cerrado', 'Respondido'],
          },
        },
      },
      // skip: (page - 1) * Number(limit),
      // take: Number(limit),
      orderBy: { id: 'desc' },
      include: {
        Destinatario: true,
        cartaAnterior: true,
        respuestas: true,
        areaResponsable: true,
        subArea: true,
        temaRelacion: true,
        empresa: true,
      },
    });

    const datesFormated = data.map((carta) => ({
      ...carta,
      fechaIngreso: carta.fechaIngreso?.toISOString().split('T')[0],
      fechaEnvio: carta.fechaEnvio?.toISOString().split('T')[0],
      fechadevencimiento: carta.fechadevencimiento?.toISOString().split('T')[0],
    }));

    return {
      data: datesFormated,
      meta: {
        // total,
        page,
        limit,
        // last_page: Math.ceil(total / limit),
      },
    };
  }
  //Get One Card
  async findOne(id: number) {
    const carta = await this.prisma.carta.findUnique({
      where: { id },
      include: {
        subArea: true,
        areaResponsable: true,
        cartaAnterior: true,
        temaRelacion: true,
        empresa: true,
        respuestas: true,
        Destinatario: true,
      },
    });

    if (!carta) {
      throw new Error(`Carta con ID ${id} no encontrada`);
    }

    return {
      ...carta,
      correosCopia: carta.correosCopia,
      fechaIngreso: carta.fechaIngreso?.toISOString().split('T')[0],
      fechaEnvio: carta.fechaEnvio?.toISOString().split('T')[0],
      fechadevencimiento: carta.fechadevencimiento?.toISOString().split('T')[0],
      createdAt: carta.createdAt.toISOString().split('T')[0],
      updatedAt: carta.updatedAt.toISOString().split('T')[0],
    };
  }
  //Patch One Card
  async update(id: number, updateCardDto: UpdateCardDto) {
    const { archivosAdjuntos, ...rest } = updateCardDto;

    const carta = await this.prisma.carta.findUnique({
      where: { id },
      include: {
        subArea: {
          include: {
            usuarios: true,
          },
        },
        areaResponsable: true,
        cartaAnterior: true,
        temaRelacion: true,
        empresa: true,
        respuestas: true,
      },
    });

    if (!carta) {
      throw new Error(`Carta con ID ${id} no encontrada`);
    }

    await Promise.all(
      carta.subArea.usuarios.map(async (usuario) => {
        const email = {
          email: usuario.email,
          nombre: usuario.nombre,
          cc: carta.correosCopia || [],
          priority: carta.nivelImpacto,
          asunto: carta.asunto,
          fechaIngreso: carta.fechaIngreso.toISOString().split('T')[0],
          resumenRecibido: carta.resumenRecibido,
          urgente: carta.urgente,
          estado: carta.estado,
          pdfInfo: carta.pdfInfo,
          archivosAdjuntos: carta.archivosAdjuntos,
        };
        try {
          this.mail.sendUrgentNotificaciont(email);
          this.logger.log(
            `Correo enviado a ${usuario.email} sobre la carta Urgente`,
          );
        } catch (error) {
          this.logger.error(
            `Error al enviar correo a ${usuario.email}: ${error.message}`,
          );
        }
      }),
    );

    return this.prisma.carta.update({
      where: { id },
      data: {
        ...rest,
        ...(archivosAdjuntos && archivosAdjuntos.length > 0
          ? { archivosAdjuntos }
          : {}),
        observaciones: null,
        estado: 'Ingresado',
      },
    });
  }
  remove(id: number) {
    return this.prisma.carta.delete({
      where: { id },
    });
  }

  async sendMail(id: number) {
    const carta = await this.findOne(id);

    const { subAreaId, correosCopia, nivelImpacto, ...rest } = carta;

    if (subAreaId) {
      const subArea = await this.prisma.subArea.findUnique({
        where: { id: subAreaId },
        include: { usuarios: true },
      });

      if (!subArea) {
        throw new NotFoundException('La subárea no existe');
      }

      for (const usuario of subArea.usuarios) {
        let email = {
          email: usuario.email,
          nombre: usuario.nombre,
          cc: correosCopia || [],
          priority: nivelImpacto,
          asunto: carta.asunto,
          fechaIngreso: carta.fechaIngreso.toString().split('T')[0],
          resumenRecibido: carta.resumenRecibido,
          urgente: carta.urgente,
          estado: carta.estado,
          pdfInfo: carta.pdfInfo,
          archivosAdjuntos: carta.archivosAdjuntos,
        };
        try {
          this.mail.sendUrgentNotificaciont(email);
          this.logger.log(
            `Correo enviado a ${usuario.email} sobre la carta Urgente`,
          );
        } catch (error) {
          this.logger.error(
            `Error al enviar correo a ${usuario.email}: ${error.message}`,
          );
        }
      }
    }
  }

  async reportsCards(id: bigint) {
    const getTrazabilidad = async (cartaId: bigint): Promise<any> => {
      const carta = await this.prisma.carta.findUnique({
        where: { id: cartaId },
        include: { cartaAnterior: true, respuestas: true }, // Incluir la carta anterior
      });

      if (!carta) {
        return null;
      }

      if (carta.cartaAnterior) {
        carta.cartaAnterior = await getTrazabilidad(carta.cartaAnterior.id);
      }

      return carta;
    };

    const trazabilidad = await getTrazabilidad(id);

    const formatDates = (carta) => {
      return {
        ...carta,
        fechaIngreso: carta.fechaIngreso?.toISOString().split('T')[0],
        fechaEnvio: carta.fechaEnvio?.toISOString().split('T')[0],
        fechadevencimiento: carta.fechadevencimiento
          ?.toISOString()
          .split('T')[0],
        cartaAnterior: carta.cartaAnterior
          ? formatDates(carta.cartaAnterior)
          : null, // Formatear recursivamente
      };
    };
    return formatDates(trazabilidad);
  }

  async createReceivedCard(receivedCardDto: ReceivedCardDto) {
    const {
      referencia,
      subAreaId,
      urgente,
      correosCopia,
      nivelImpacto,
      codigoRecibido,
      ...rest
    } = receivedCardDto;

    if (codigoRecibido) {
      const cartaExistente = await this.prisma.carta.findFirst({
        where: { codigoRecibido: codigoRecibido },
      });
      if (cartaExistente) {
        throw new BadRequestException('Una carta con ese código ya existe');
      }
    }

    if (referencia) {
      const cartaAnterior = await this.prisma.carta.findUnique({
        where: { id: referencia },
      });
      if (!cartaAnterior) {
        throw new NotFoundException('La carta anterior no existe');
      }
      if (cartaAnterior.estado === 'Cerrado') {
        throw new BadRequestException('La carta anterior ya está cerrada');
      }
      await this.prisma.carta.update({
        where: { id: referencia },
        data: {
          estado: 'Cerrado',
        },
      });
    }
    if (subAreaId && urgente) {
      const subArea = await this.prisma.subArea.findUnique({
        where: { id: subAreaId },
        include: { usuarios: true },
      });

      if (!subArea) {
        throw new NotFoundException('La subárea no existe');
      }

      await Promise.all(
        subArea.usuarios.map(async (usuario) => {
          const email = {
            email: usuario.email,
            nombre: usuario.nombre,
            cc: correosCopia || [],
            priority: nivelImpacto,
            asunto: receivedCardDto.asunto,
            fechaIngreso: receivedCardDto.fechaIngreso
              .toISOString()
              .split('T')[0],
            resumenRecibido: receivedCardDto.resumenRecibido,
            urgente: urgente,
            estado: 'Ingresado',
            pdfInfo: receivedCardDto.pdfInfo,
            archivosAdjuntos: receivedCardDto?.archivosAdjuntos,
          };

          try {
            this.mail.sendUrgentNotificaciont(email);
            this.logger.log(
              `Correo enviado a ${usuario.email} sobre la carta Urgente`,
            );
          } catch (error) {
            this.logger.error(
              `Error al enviar correo a ${usuario.email}: ${error.message}`,
            );
          }
        }),
      );
    }

    if (referencia) {
      return this.prisma.carta.create({
        data: {
          ...rest,
          codigoRecibido,
          subAreaId,
          referencia,
          urgente,
          nivelImpacto,
        },
      });
    } else {
      return this.prisma.carta.create({
        data: {
          ...rest,
          codigoRecibido,
          subAreaId,
          urgente,
          nivelImpacto,
        },
      });
    }
  }

  async assignedCard(id: number, assignedCardDto: AssignedCardDto) {
    return this.prisma.carta.update({
      where: { id },
      data: assignedCardDto,
    });
  }

  async closeCard(id: number) {
    let estado = 'Cerrado';

    return this.prisma.carta.update({
      where: { id },
      data: {
        estado,
      },
    });
  }

  async reopenCard(id: number, body: any) {
    let estado = 'Ingresado';

    return this.prisma.carta.update({
      where: { id },
      data: {
        estado,
        motivoReapertura: body.motivo,
      },
    });
  }
  //AnswerPendingCard, Answer a Card of Pendings
  async pendingCard(id: number, pendingCardDto: PendingCardDto) {
    const { devuelto, ...rest } = pendingCardDto;

    let estado;
    if (devuelto) {
      estado = 'Pendiente';
    } else {
      estado = 'Respondido';
    }

    return this.prisma.carta.update({
      where: { id },
      data: {
        ...rest,
        estado,
        devuelto,
        motivoReapertura: null,
      },
    });
  }

  async assignmentCard(id: number, assignmentCardDto: AssignmentCardDto) {
    return this.prisma.carta.update({
      where: { id },
      data: assignmentCardDto,
    });
  }

  async findAllEmision() {
    const cartas = await this.prisma.carta.findMany({
      where: {
        emision: true,
      },
    });
    return cartas.map((carta) => ({
      ...carta,
      fechaIngreso: carta.fechaIngreso?.toISOString().split('T')[0],
      fechaEnvio: carta.fechaEnvio?.toISOString().split('T')[0],
      fechadevencimiento: carta.fechadevencimiento?.toISOString().split('T')[0],
    }));
  }

  //Get all Pendings Cards
  async findAllPendientes(subAreaId: number, paginationDto: PaginationDto) {
    const { page, limit, search, searchBy, filters } = paginationDto;

    let where: any = {};

    if (subAreaId === 0) {
      where = {
        informativo: false,

        estado: {
          in: ['Ingresado'],
        },
      };
    } else {
      where = {
        informativo: false,
        subAreaId: subAreaId,
        estado: 'Ingresado',
      };
    }

    const total = await this.prisma.carta.count({ where });

    const cartas = await this.prisma.carta.findMany({
      where,
      // skip: (page - 1) * Number(limit),
      // take: Number(limit),
      orderBy: { id: 'desc' },
      include: {
        areaResponsable: true,
        subArea: true,
        temaRelacion: true,
        empresa: true,
        Destinatario: true,
      },
    });

    const datesFormated = cartas.map((carta) => ({
      ...carta,
      fechaIngreso: carta.fechaIngreso?.toISOString().split('T')[0],
      fechaEnvio: carta.fechaEnvio?.toISOString().split('T')[0],
      fechadevencimiento: carta.fechadevencimiento?.toISOString().split('T')[0],
    }));

    return {
      data: datesFormated,
      meta: {
        total,
        // page,
        // limit,
        // last_page: Math.ceil(total / limit),
      },
    };
  }
  async findStats(userId: bigint, subAreaIParam: number | undefined) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
      include: { rol: true, subArea: true },
    });

    if (!usuario) throw new Error('Usuario no encontrado');

    const isAdmin = usuario.rol.nombre === 'admin';
    const subAreaId = usuario.subAreaId;
    const now = new Date();
    const filterAdmin = subAreaIParam ? { subAreaId: subAreaIParam } : {};
    const whereBase = isAdmin ? { ...filterAdmin } : { subAreaId };

    const [
      groupByEstado,
      total,
      porResponder,
      urgentesPorResponder,
      vencidasPorResponder,
      informativasPorResponder,
      totalEmisionActivo,
      totalEmisionDesactivo,
      totalPartidaActivo,
      totalPartidaDesactivo,
      totalNivelImpactoAlto,
      totalNivelImpactoBajo,
      totalCartasUrgentes,
      totalCartasNoUrgentes,
      totalInformativas,
      totalNoInformativas,
    ] = await Promise.all([
      this.prisma.carta.groupBy({
        by: ['subAreaId', 'estado'],
        _count: {
          _all: true,
        },
        where: whereBase,
      }),

      this.prisma.carta.count({ where: whereBase }),
      this.prisma.carta.count({
        where: {
          ...whereBase,
          estado: { not: 'Cerrado' },
        },
      }),
      this.prisma.carta.count({
        where: {
          ...whereBase,
          estado: 'Pendiente',
          urgente: true,
        },
      }),
      this.prisma.carta.count({
        where: {
          ...whereBase,
          vencimiento: true,
          fechadevencimiento: { lt: now },
          estado: { not: 'Cerrado' },
        },
      }),
      this.prisma.carta.count({
        where: {
          ...whereBase,
          informativo: true,
        },
      }),
      this.prisma.carta.count({ where: { emision: true } }),
      this.prisma.carta.count({ where: { emision: false } }),
      this.prisma.carta.count({ where: { vencimiento: true } }),
      this.prisma.carta.count({ where: { vencimiento: false } }),
      this.prisma.carta.count({ where: { nivelImpacto: 'ALTO' } }),
      this.prisma.carta.count({ where: { nivelImpacto: 'BAJO' } }),
      this.prisma.carta.count({ where: { urgente: true } }),
      this.prisma.carta.count({ where: { urgente: false } }),
      this.prisma.carta.count({ where: { informativo: true } }),
      this.prisma.carta.count({ where: { informativo: false } }),
    ]);

    const agrupadoPorEstado = Object.values(
      groupByEstado.reduce(
        (acc, item) => {
          const id = Number(item.subAreaId);
          const estado = item.estado;
          const count = item._count._all;

          if (!acc[id]) {
            acc[id] = {
              subArea: id,
              estados: {
                Ingresado: 0,
                Respondido: 0,
                Pendiente: 0,
                Cerrado: 0,
              },
            };
          }

          // Asegúrate de que el estado exista en la subArea y asigna el valor
          acc[id].estados[estado] = count;

          return acc;
        },
        {} as Record<
          number,
          { subArea: number; estados: Record<string, number> }
        >,
      ),
    );
    return {
      total,
      porResponder,
      urgentesPorResponder,
      vencidasPorResponder,
      informativasPorResponder,
      totalEmisionActivo,
      totalEmisionDesactivo,
      totalPartidaActivo,
      totalPartidaDesactivo,
      totalNivelImpactoAlto,
      totalNivelImpactoBajo,
      totalCartasUrgentes,
      totalCartasNoUrgentes,
      totalInformativas,
      totalNoInformativas,
      agrupadoPorEstado: await Promise.all(
        agrupadoPorEstado.map(async (item) => {
          const subArea = await this.prisma.subArea.findUnique({
            where: { id: item.subArea },
          });

          return {
            ...item,
            subArea: subArea?.nombre ?? 'Desconocida',
          };
        }),
      ),
    };
  }
}
