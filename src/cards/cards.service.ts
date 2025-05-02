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

@Injectable()
export class CardsService {
  private readonly logger = new Logger(CardsService.name);

  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async handleCron() {
    this.logger.debug(
      'Iniciando proceso de envío de correos para cartas pendientes',
    );

    const today = new Date();
    const todayDateString = new Date(today.setHours(23, 59, 59, 999));

    const newCards = await this.prisma.carta.findMany({
      where: {
        estado: 'Ingresado',
        fechaEnvio: null,
        fechaIngreso: {
          lte: todayDateString,
        },
      },
      include: { subArea: true },
    });

    this.logger.log(`Cartas nuevas encontradas: ${newCards.length}`);

    // const pendingCards = await this.prisma.carta.findMany({
    //   where: {
    //     estado: 'Pendiente',
    //     informativo: false,
    //   },
    //   include: { subArea: true },
    // });
    //

    // Si no hay cartas nuevas ni pendientes, no hacer nada
    // if (newCards.length === 0 && pendingCards.length === 0) {
    //   this.logger.debug('No hay cartas para procesar. Saliendo...');
    //   return;
    // }

    // Agrupar cartas por subárea para optimizar notificaciones
    const cartasPorSubArea = new Map<bigint, { new: any[]; pending: any[] }>();

    for (const carta of newCards) {
      if (!cartasPorSubArea.has(carta.subAreaId)) {
        cartasPorSubArea.set(carta.subAreaId, { new: [], pending: [] });
      }
      cartasPorSubArea.get(carta.subAreaId).new.push(carta);
    }

    // for (const carta of pendingCards) {
    //   if (!cartasPorSubArea.has(carta.subAreaId)) {
    //     cartasPorSubArea.set(carta.subAreaId, { new: [], pending: [] });
    //   }
    //   cartasPorSubArea.get(carta.subAreaId).pending.push(carta);
    // }

    for (const [subAreaId, cartas] of cartasPorSubArea.entries()) {
      await this.processSubArea(subAreaId, cartas.new, cartas.pending);
    }
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

    this.logger.log(`Cantidad de cartas a enviar ${allCards.length}`);

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

    await Promise.all(
      usuarios.map((usuario) =>
        Promise.all(
          Array.from(gruposCC.entries()).map(async ([ccKey, cartas]) => {
            const ccList = ccKey.split(';').filter(Boolean);

            const email = {
              email: usuario.email,
              nombre: usuario.nombre,
              cc: ccList,
            };

            try {
              await this.mail.sendNotification(email, cartas);
              this.logger.log(
                `Correo enviado a ${usuario.email} con ${cartas.length} cartas ` +
                  `(CC: ${ccList.length > 0 ? ccList.join(', ') : 'ninguno'})`,
              );
            } catch (error) {
              this.logger.error(
                `Error al enviar correo a ${usuario.email}: ${error.message}`,
              );
            }
          }),
        ),
      ),
    );

    if (newCards.length > 0) {
      await this.prisma.carta.updateMany({
        where: {
          id: { in: newCards.map((c) => c.id) },
        },
        data: {
          fechaEnvio: new Date(),
          estado: 'Pendiente',
        },
      });

      this.logger.log(
        `${newCards.length} cartas nuevas marcadas como enviadas`,
      );
    }
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
        };
        try {
          await this.mail.sendUrgentNotificaciont(email);
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
          };

          try {
            await this.mail.sendUrgentNotificaciont(email);
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
        estado: {
          in: ['Ingresado', 'Respondido'],
        },
      };
    } else {
      where = {
        subAreaId: subAreaId,
        AND: [
          {
            estado: 'Ingresado',
          },
        ],
      };
    }

    const total = await this.prisma.carta.count({ where });

    const cartas = await this.prisma.carta.findMany({
      where,
      skip: (page - 1) * Number(limit),
      take: Number(limit),
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
        page,
        limit,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async findStats(userId: bigint) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
      include: { rol: true, subArea: true },
    });

    if (!usuario) throw new Error('Usuario no encontrado');

    const isAdmin = usuario.rol.nombre === 'admin';
    const subAreaId = usuario.subAreaId;
    const now = new Date();

    // Consultas base para todos los usuarios
    const baseQueries = {
      enPosesion: !isAdmin
        ? this.prisma.carta.count({
            where: {
              subAreaId,
              estado: 'Pendiente',
            },
          })
        : Promise.resolve(0),

      respondidas: this.prisma.carta.count({
        where: isAdmin
          ? { estado: 'Cerrado' }
          : { subAreaId, estado: 'Cerrado' },
      }),

      informativas: this.prisma.carta.count({
        where: isAdmin
          ? { informativo: true }
          : { subAreaId, informativo: true },
      }),

      urgentes: this.prisma.carta.count({
        where: isAdmin
          ? { estado: 'Pendiente', urgente: true }
          : { subAreaId, estado: 'Pendiente', urgente: true },
      }),

      vencidas: this.prisma.carta.count({
        where: isAdmin
          ? {
              vencimiento: true,
              fechadevencimiento: { lt: now },
              estado: { not: 'Cerrado' },
            }
          : {
              subAreaId,
              vencimiento: true,
              fechadevencimiento: { lt: now },
              estado: { not: 'Cerrado' },
            },
      }),

      total: isAdmin
        ? this.prisma.carta.count()
        : this.prisma.carta.count({ where: { subAreaId } }),
    };

    // Consultas específicas para admin (KPIs)
    const adminQueries = isAdmin
      ? {
          pendientesGlobal: this.prisma.carta.count({
            where: { estado: { in: ['Pendiente'] } },
          }),

          respondidasFueraPlazo: this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint 
      FROM "Carta"
      WHERE estado = 'Cerrado'
      AND "fechaEnvio" IS NOT NULL
      AND "fechadevencimiento" IS NOT NULL
      AND "fechadevencimiento" < "fechaEnvio"
    `,

          // Tiempo promedio de respuesta en días (solo cartas cerradas)
          tiempoPromedio: this.prisma.$queryRaw<{ avg_days: number }[]>`
        SELECT AVG(
          EXTRACT(EPOCH FROM ("fechaEnvio" - "fechaIngreso"))/86400
        )::integer as avg_days
        FROM "Carta"
        WHERE estado = 'Cerrado'
        AND "fechaEnvio" IS NOT NULL
        AND "fechaIngreso" IS NOT NULL
      `,
        }
      : null;

    // Ejecutar consultas en paralelo
    const [baseResults, adminResults] = await Promise.all([
      Promise.all(Object.values(baseQueries)),
      isAdmin ? Promise.all(Object.values(adminQueries!)) : Promise.resolve([]),
    ]);
    // Formatear resultados
    const stats: any = {
      cartasEnPosesion: !isAdmin ? baseResults[0] : undefined,
      cartasRespondidas: baseResults[1],
      cartasInformativas: baseResults[2],
      cartasUrgentes: baseResults[3],
      cartasVencidas: baseResults[4],
      total: baseResults[5],
      porcentajeRespuesta: Math.round(
        (baseResults[1] / (baseResults[5] || 1)) * 100,
      ),
    };

    // Agregar KPIs para admin
    if (isAdmin && adminResults.length > 0) {
      const fueraPlazoCount = adminResults[1]?.[0]?.count || 0;

      stats.kpis = {
        pendientesGlobales: adminResults[0],
        tasaRespuesta:
          baseResults[5] > 0
            ? Number((baseResults[1] / baseResults[5]).toFixed(2))
            : 0,
        eficienciaPlazos:
          baseResults[1] > 0
            ? Number(
                ((baseResults[1] - adminResults[1]) / baseResults[1]).toFixed(
                  2,
                ),
              )
            : 0,
        tiempoPromedioDias: adminResults[2]?.[0]?.avg_days || 0,
        respondidasFueraPlazo: Number(fueraPlazoCount),
      };
    }

    return stats;
  }
}
