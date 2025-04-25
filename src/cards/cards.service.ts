import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class CardsService {
  private readonly logger = new Logger(CardsService.name)

  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async handleCron() {
    this.logger.debug('Iniciando proceso de envío de correos para cartas pendientes');
  
    const today = new Date();
    const todayDateString = new Date(today.setHours(23, 59, 59, 999));
  
    // Procesar cartas nuevas que deben ser enviadas por primera vez
    const newCards = await this.prisma.carta.findMany({
      where: {
        estado: "Ingresado",
        fechaEnvio: null,
        fechaIngreso: {
          lte: todayDateString
        }
      },
      include: { subArea: true }
    });
  
    this.logger.log(`Cartas nuevas encontradas: ${newCards.length}`);
  
    // Procesar cartas pendientes que necesitan recordatorio
    const pendingCards = await this.prisma.carta.findMany({
      where: {
        estado: "PendienteArea",
        informativo: false,
        // fechaEnvio: {
        //   lt: new Date(new Date().setDate(new Date().getDate() - 1))
        // }
      },
      include: { subArea: true }
    });
  
    this.logger.log(`Cartas pendientes encontradas: ${pendingCards.length}`);
  
    // Si no hay cartas nuevas ni pendientes, no hacer nada
    if (newCards.length === 0 && pendingCards.length === 0) {
      this.logger.debug('No hay cartas para procesar. Saliendo...');
      return;
    }
  
    // Agrupar cartas por subárea para optimizar notificaciones
    const cartasPorSubArea = new Map<bigint, {new: any[], pending: any[]}>();
  
    // Procesar cartas nuevas
    for (const carta of newCards) {
      if (!cartasPorSubArea.has(carta.subAreaId)) {
        cartasPorSubArea.set(carta.subAreaId, {new: [], pending: []});
      }
      cartasPorSubArea.get(carta.subAreaId).new.push(carta);
    }
  
    // Procesar cartas pendientes
    for (const carta of pendingCards) {
      if (!cartasPorSubArea.has(carta.subAreaId)) {
        cartasPorSubArea.set(carta.subAreaId, {new: [], pending: []});
      }
      cartasPorSubArea.get(carta.subAreaId).pending.push(carta);
    }
  
    // Procesar cada subárea
    for (const [subAreaId, cartas] of cartasPorSubArea.entries()) {
      await this.processSubArea(subAreaId, cartas.new, cartas.pending);
    }
  }
  
  private async processSubArea(subAreaId: bigint, newCards: any[], pendingCards: any[]) {
    // Buscar usuarios de la subárea
    const usuarios = await this.prisma.usuario.findMany({
      where: { subAreaId },
    });
  
    if (usuarios.length === 0) {
      this.logger.warn(`Subárea ${subAreaId} no tiene usuarios asignados`);
      return;
    }
  
    // Combinar todas las cartas
    const allCards = [...newCards, ...pendingCards];
    
    // Si no hay cartas, no hacer nada
    if (allCards.length === 0) {
      return;
    }
    this.logger.log(`Cantidad de cartas a enviar ${allCards.length}`)
    // 1. Agrupar cartas por su lista de CC (creamos un hash único para cada combinación de CC)
    const gruposCC = new Map<string, any[]>();
    
    for (const carta of allCards) {
      // Normalizar los CC: ordenar alfabéticamente y eliminar duplicados
      const ccNormalizados = Array.from(new Set(carta.correosCopia || []))
        .sort()
        .join(';');
      
      if (!gruposCC.has(ccNormalizados)) {
        gruposCC.set(ccNormalizados, []);
      }
      gruposCC.get(ccNormalizados).push(carta);
    }
  
    // 2. Procesar cada grupo de CC
    for (const usuario of usuarios) {
      for (const [ccKey, cartas] of gruposCC.entries()) {
        const ccList = ccKey.split(';').filter(Boolean); // Convertir de vuelta a array
        
        const email = {
          email: usuario.email,
          nombre: usuario.nombre,
          cc: ccList // Usar solo los CC correspondientes a este grupo
        };
  
        try {
          await this.mail.sendNotification(email, cartas);
          this.logger.log(
            `Correo enviado a ${usuario.email} con ${cartas.length} cartas ` +
            `(CC: ${ccList.length > 0 ? ccList.join(', ') : 'ninguno'})`
          );
        } catch (error) {
          this.logger.error(`Error al enviar correo a ${usuario.email}: ${error.message}`);
        }
      }
    }
  
    // 3. Actualizar cartas nuevas (marcar como enviadas)
    if (newCards.length > 0) {
      await this.prisma.carta.updateMany({
        where: {
          id: { in: newCards.map(c => c.id) }
        },
        data: { 
          fechaEnvio: new Date(),
          estado: "PendienteArea" 
        },
      });
      this.logger.log(`${newCards.length} cartas nuevas marcadas como enviadas`);
    }
  
    
  }


  //Create a card 
  async create(createCardDto: CreateCardDto) {

    const { referencia, ...rest} =  createCardDto;


    if (referencia) {
      const cartaAnterior = await this.prisma.carta.findUnique({
        where: { id: referencia}
      });

      if (!cartaAnterior) {
        throw new NotFoundException('La carta anterior no existe')
      }
    }


    return this.prisma.carta.create({
      data: {
        ...rest,
        referencia
      },
    });
  }
  //Get all Card with Paginations and Filters
  async findAll(paginationDto: PaginationDto) {

    const { page, limit, search, searchBy, filters} = paginationDto

    console.log("que recibimos", paginationDto);
    let where = {}

    if (search && searchBy) {
      where = {
        OR: searchBy.map((column)=>({
          [column]: {
            contains: search,
            mode: 'insensitive'
          }
        }))
      }
    }
  // Filtros adicionales (filters)
  if (filters) {
    const filterConditions = Object.keys(filters)
      .filter((key) => filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) // Ignorar filtros vacíos
      .map((key) => {
        // Convertir fechaIngreso a un objeto Date si es necesario
        if (key === 'fechaIngreso' && filters[key]) {
          return {
            [key]: new Date(filters[key]), // Convertir a DateTime
          };
        }
        return {
          [key]: filters[key],
        };
      });

    // Solo agregar AND si hay condiciones de filtro válidas
    if (filterConditions.length > 0) {
      where = {
        ...where,
        AND: filterConditions,
      };
    }
  }
    console.log("where>>", where)

    const total = await this.prisma.carta.count({where})

    const data = await this.prisma.carta.findMany({
      where,
      skip: (page-1) * Number(limit),
      take: Number(limit),
      orderBy: {id: 'desc'},
      include: {cartaAnterior: true, respuestas: true, areaResponsable: true, subArea: true, temaRelacion: true, empresa: true}
    })

    
    
    const datesFormated = data.map(carta=> ({
      ...carta,
      fechaIngreso: carta.fechaIngreso?.toISOString().split('T')[0],
      fechaEnvio: carta.fechaEnvio?.toISOString().split('T')[0],
      fechadevencimiento: carta.fechadevencimiento?.toISOString().split('T')[0]
    }))

    return {
      data: datesFormated,
      meta: {
        total,
        page,
        limit,
        last_page: Math.ceil(total/limit)
      }
    }

  }
  //Get One Card
  async findOne(id: number) {
    const carta = await this.prisma.carta.findUnique({
      where: { id },
      include: { subArea: true, areaResponsable: true, cartaAnterior: true, temaRelacion: true, empresa: true, respuestas: true }
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
    console.log(updateCardDto)
    return this.prisma.carta.update({
      where: { id },
      data: updateCardDto,
    });
  }
  //Delete One Card
  remove(id: number) {
    return this.prisma.carta.delete({
      where: { id },
    });
  }

  async sendMail(id: number){
    const carta = await this.findOne(id);

    const {subAreaId, correosCopia, nivelImpacto, ...rest} = carta

      if (subAreaId) {
            const subArea = await this.prisma.subArea.findUnique({
              where: {id: subAreaId},
              include: { usuarios: true }
            });

            if (!subArea) {
              throw new NotFoundException('La subárea no existe');
            }

            for (const usuario of subArea.usuarios) {
              let email = {
                email: usuario.email,
                nombre: usuario.nombre,
                cc: correosCopia || [],
                priority: nivelImpacto
              };
              try {
                this.mail.sendUrgentNotificaciont(email); // No usamos await para no bloquear el flujo
                this.logger.log(`Correo enviado a ${usuario.email} sobre la carta Urgente`);
              } catch (error) {
                this.logger.error(`Error al enviar correo a ${usuario.email}: ${error.message}`);
              }
            }

          }

  }

  //Get One Card for Trazability
  async reportsCards(id: bigint) {
    const getTrazabilidad = async (cartaId: bigint): Promise<any> => {
      const carta = await this.prisma.carta.findUnique({
        where: { id: cartaId },
        include: { cartaAnterior: true, respuestas: true }, // Incluir la carta anterior
      });
  
      if (!carta) {
        return null; // Si no existe la carta, retornar null
      }
  
      // Si existe una carta anterior, obtener su trazabilidad recursivamente
      if (carta.cartaAnterior) {
        carta.cartaAnterior = await getTrazabilidad(carta.cartaAnterior.id);
      }
  
      return carta;
    };
  
    // Obtener la trazabilidad de la carta solicitada
    const trazabilidad = await getTrazabilidad(id);
  
    // Formatear las fechas
    const formatDates = (carta) => {
      return {
        ...carta,
        fechaIngreso: carta.fechaIngreso?.toISOString().split('T')[0],
        fechaEnvio: carta.fechaEnvio?.toISOString().split('T')[0],
        fechadevencimiento: carta.fechadevencimiento?.toISOString().split('T')[0],
        cartaAnterior: carta.cartaAnterior ? formatDates(carta.cartaAnterior) : null, // Formatear recursivamente
      };
    };
    return formatDates(trazabilidad);
    
  }
  //Create card for Assing Form
  async createReceivedCard(receivedCardDto: ReceivedCardDto) {
    const {referencia,  subAreaId,urgente,correosCopia, nivelImpacto ,codigoRecibido , ...rest} = receivedCardDto
    
    if (codigoRecibido) {
      const cartaExistente = await this.prisma.carta.findFirst({
        where: { codigoRecibido: codigoRecibido}
      });
      if (cartaExistente) {
        throw new BadRequestException('Una carta con ese código ya existe');
      }
    }

    if (referencia) {
      const cartaAnterior = await this.prisma.carta.findUnique({
        where: { id: referencia}
      });
      if (!cartaAnterior) {
        throw new NotFoundException('La carta anterior no existe')
      }
      if (cartaAnterior.estado === 'Cerrado') {
        throw new BadRequestException('La carta anterior ya está cerrada');
      }
      await this.prisma.carta.update({
        where: { id: referencia},
        data: {
          estado: 'Cerrado'
        }
      })
    }
    if (subAreaId && urgente) {
       const subArea = await this.prisma.subArea.findUnique({
        where: {id: subAreaId},
        include: { usuarios: true }
       });

       if (!subArea) {
        throw new NotFoundException('La subárea no existe');
      }

       for (const usuario of subArea.usuarios) {
        let email = {
          email: usuario.email,
          nombre: usuario.nombre,
          cc: correosCopia || [],
          priority: nivelImpacto
        };
        try {
          this.mail.sendUrgentNotificaciont(email); // No usamos await para no bloquear el flujo
          this.logger.log(`Correo enviado a ${usuario.email} sobre la carta Urgente`);
        } catch (error) {
          this.logger.error(`Error al enviar correo a ${usuario.email}: ${error.message}`);
        }
      }

    }
    //if else, al llegar referencia con valor 0, uso para que no exista error en referenca
    if (referencia) {
      return this.prisma.carta.create({
        data: {
          ...rest,
          codigoRecibido,
          subAreaId,
          referencia,
          urgente,
          nivelImpacto
        },
      });      
    } else {
    return this.prisma.carta.create({
      data: {
        ...rest,
        codigoRecibido,
        subAreaId,
        urgente,
        nivelImpacto
      },
    });
    }

  }

  async assignedCard(id: number, assignedCardDto: AssignedCardDto ){
    return this.prisma.carta.update({
      where: { id },
      data: assignedCardDto
    })
  }

  //AnswerPendingCard, Answer a Card of Pendings
  async pendingCard(id: number, pendingCardDto: PendingCardDto){
    const {devuelto, ...rest} = pendingCardDto

    let estado = "Pendiente";

    return this.prisma.carta.update({
      where: { id },
      data: {
        ...rest,
        estado,
        devuelto
      }
    })
  }

  async assignmentCard(id: number, assignmentCardDto: AssignmentCardDto){
    return this.prisma.carta.update({
      where: { id },
      data: assignmentCardDto
    })
  }


  async findAllEmision() {
    const cartas = await this.prisma.carta.findMany({
      where: {
        emision: true
      }
    });
    return cartas.map(carta=> ({
      ...carta,
      fechaIngreso: carta.fechaIngreso?.toISOString().split('T')[0],
      fechaEnvio: carta.fechaEnvio?.toISOString().split('T')[0],
      fechadevencimiento: carta.fechadevencimiento?.toISOString().split('T')[0]
    }))
  }

  //Get all Pendings Cards
  async findAllPendientes(subAreaId: number, paginationDto: PaginationDto) {
    const { page, limit, search, searchBy, filters } = paginationDto;
    console.log("subarea", subAreaId);
    
    // Definir el where inicial con el filtro de subAreaId y estado 'Pendiente'
      // Definir el where inicial
    let where: any = {}
    
    if (subAreaId === 0) {
      where ={
        AND: [
          { estado: { not: "PendienteArea" } },
          { estado: { not: "Cerrado"}},
          { estado: { not: "Ingresado"}},
        ],
      }; 
    }else{
      where = {
        subAreaId: subAreaId,
        AND: [
          { estado: { not: "Pendiente" } },
          { estado: { not: "Cerrado"}},
          { estado: { not: "Ingresado"}},
          {
            AND: [
              { comentario: null},
              { cartaborrador: null}
            ]
          }
        ]
      }
    }
    // Búsqueda (search)
    if (search && searchBy) {
      where = {
        ...where,
        OR: searchBy.map((column) => ({
          [column]: {
            contains: search,
            mode: 'insensitive', // Búsqueda insensible a mayúsculas/minúsculas
          },
        })),
      };
    }
  
    // Filtros adicionales (filters)
    if (filters) {
      const filterConditions = Object.keys(filters)
        .filter((key) => filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) // Ignorar filtros vacíos
        .map((key) => {
          // Convertir fechas a objetos Date si es necesario
          if ((key === 'fechaIngreso' || key === 'fechadevencimiento') && filters[key]) {
            return {
              [key]: new Date(filters[key]), // Convertir a DateTime
            };
          }
          return {
            [key]: filters[key],
          };
        });
  
      // Solo agregar AND si hay condiciones de filtro válidas
      if (filterConditions.length > 0) {
        where = {
          ...where,
          AND: filterConditions,
        };
      }
    }
    console.log("where final", where);
    
    // Obtener el total de cartas pendientes para la subárea con los filtros aplicados
    const total = await this.prisma.carta.count({ where });
  
    // Obtener las cartas paginadas
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
      },
    });
  
    // Formatear las fechas
    const datesFormated = cartas.map((carta) => ({
      ...carta,
      fechaIngreso: carta.fechaIngreso?.toISOString().split('T')[0],
      fechaEnvio: carta.fechaEnvio?.toISOString().split('T')[0],
      fechadevencimiento: carta.fechadevencimiento?.toISOString().split('T')[0],
    }));
  
    // Retornar los datos paginados y la metadata
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
      include: { rol: true, subArea: true }
    });
  
    if (!usuario) throw new Error('Usuario no encontrado');
  
    const isAdmin = usuario.rol.nombre === 'admin';
    const subAreaId = usuario.subAreaId;
    const now = new Date();
  
    // Consultas base para todos los usuarios
    const baseQueries = {
      enPosesion: !isAdmin ? this.prisma.carta.count({
        where: { 
          subAreaId,
          estado: 'PendienteArea'
        }
      }) : Promise.resolve(0),
      
      respondidas: this.prisma.carta.count({
        where: isAdmin 
          ? { estado: 'Cerrado' }
          : { subAreaId, estado: 'Cerrado' }
      }),
      
      informativas: this.prisma.carta.count({
        where: isAdmin
          ? { informativo: true }
          : { subAreaId, informativo: true }
      }),
      
      urgentes: this.prisma.carta.count({
        where: isAdmin
          ? { estado: 'PendienteArea', urgente: true }
          : { subAreaId, estado: 'PendienteArea', urgente: true }
      }),
      
      vencidas: this.prisma.carta.count({
        where: isAdmin
          ? { 
              vencimiento: true, 
              fechadevencimiento: { lt: now },
              estado: { not: 'Cerrado' }
            }
          : { 
              subAreaId,
              vencimiento: true,
              fechadevencimiento: { lt: now },
              estado: { not: 'Cerrado' }
            }
      }),
      
      total: isAdmin
        ? this.prisma.carta.count()
        : this.prisma.carta.count({ where: { subAreaId } })
    };
  
    // Consultas específicas para admin (KPIs)
    const adminQueries = isAdmin ? {
      pendientesGlobal: this.prisma.carta.count({ 
        where: { estado: { in: ['Pendiente', 'PendienteArea'] } }
      }),
      
      respondidasFueraPlazo: this.prisma.$queryRaw<{count: bigint}[]>`
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
      `
    } : null;
  
    // Ejecutar consultas en paralelo
    const [baseResults, adminResults] = await Promise.all([
      Promise.all(Object.values(baseQueries)),
      isAdmin ? Promise.all(Object.values(adminQueries!)) : Promise.resolve([])
    ]);
    // Formatear resultados
    const stats: any = {
      cartasEnPosesion: !isAdmin ? baseResults[0] : undefined,
      cartasRespondidas: baseResults[1],
      cartasInformativas: baseResults[2],
      cartasUrgentes: baseResults[3],
      cartasVencidas: baseResults[4],
      total: baseResults[5],
      porcentajeRespuesta: Math.round((baseResults[1] / (baseResults[5] || 1)) * 100)
    };
  
     // Agregar KPIs para admin
      if (isAdmin && adminResults.length > 0) {
        const fueraPlazoCount = adminResults[1]?.[0]?.count || 0;
        
        stats.kpis = {
          pendientesGlobales: adminResults[0],
          tasaRespuesta: baseResults[5] > 0 
            ? Number((baseResults[1] / baseResults[5]).toFixed(2))
            : 0,
          eficienciaPlazos: baseResults[1] > 0
            ? Number(((baseResults[1] - adminResults[1]) / baseResults[1]).toFixed(2))
            : 0,
          tiempoPromedioDias: adminResults[2]?.[0]?.avg_days || 0,
          respondidasFueraPlazo: Number(fueraPlazoCount)
        };
      }
    
  
    return stats;
  }

}
