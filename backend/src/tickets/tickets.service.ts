// import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';
// import { CreateTicketDto, UpdateTicketDto, AssignTicketDto } from './dto/ticket.dto';
// import { Role, TicketStatus } from '@prisma/client';

// const TICKET_INCLUDE = {
//   client: { include: { user: { omit: { password: true } } } },
//   technicien: { omit: { password: true } },
//   createdBy: { omit: { password: true } },
//   intervention: true,
// };

// @Injectable()
// export class TicketsService {
//   constructor(private prisma: PrismaService) {}

//   async findAll(user: any, filters?: { status?: TicketStatus; priority?: string; clientId?: string }) {
//     const where: any = {};

//     if (user.role === Role.TECHNICIEN) where.technicienId = user.id;
//     if (user.role === Role.CLIENT) where.clientId = user.client?.id;
//     if (filters?.status) where.status = filters.status;
//     if (filters?.priority) where.priority = filters.priority;
//     if (filters?.clientId && user.role === Role.MANAGER) where.clientId = filters.clientId;

//     return this.prisma.ticket.findMany({
//       where,
//       include: TICKET_INCLUDE,
//       orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
//     });
//   }

//   async findOne(id: string, user: any) {
//     const ticket = await this.prisma.ticket.findUnique({ where: { id }, include: TICKET_INCLUDE });
//     if (!ticket) throw new NotFoundException('Ticket introuvable');

//     if (user.role === Role.TECHNICIEN && ticket.technicienId !== user.id)
//       throw new ForbiddenException('Accès refusé');
//     if (user.role === Role.CLIENT && ticket.client.userId !== user.id)
//       throw new ForbiddenException('Accès refusé');

//     return ticket;
//   }

//   async create(dto: CreateTicketDto, userId: string) {
//     return this.prisma.ticket.create({
//       data: { ...dto, createdById: userId },
//       include: TICKET_INCLUDE,
//     });
//   }

//   async update(id: string, dto: UpdateTicketDto, user: any) {
//     const ticket = await this.findOne(id, user);

//     if (user.role === Role.TECHNICIEN) {
//       const allowed = ['status', 'description'];
//       const keys = Object.keys(dto).filter(k => !allowed.includes(k));
//       if (keys.length > 0) throw new ForbiddenException('Modification non autorisée');
//     }

//     const updated = await this.prisma.ticket.update({
//       where: { id },
//       data: dto,
//       include: TICKET_INCLUDE,
//     });

//     if (dto.status === TicketStatus.EN_COURS && !updated.intervention) {
//       await this.prisma.intervention.create({
//         data: { ticketId: id, description: '', startedAt: new Date() },
//       });
//     }

//     return updated;
//   }

//   async assign(id: string, dto: AssignTicketDto) {
//     return this.prisma.ticket.update({
//       where: { id },
//       data: { technicienId: dto.technicienId, status: TicketStatus.EN_COURS },
//       include: TICKET_INCLUDE,
//     });
//   }

//   async remove(id: string) {
//     await this.prisma.ticket.findUniqueOrThrow({ where: { id } });
//     return this.prisma.ticket.delete({ where: { id } });
//   }
// }


import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto, UpdateTicketDto, AssignTicketDto } from './dto/ticket.dto';
import { Role, TicketStatus } from '@prisma/client';

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  isActive: true,
};

const TICKET_INCLUDE = {
  client: {
    include: {
      user: {
        select: USER_SELECT,
      },
    },
  },
  technicien: {
    select: USER_SELECT,
  },
  createdBy: {
    select: USER_SELECT,
  },
  intervention: true,
};

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    user: any,
    filters?: { status?: TicketStatus; priority?: string; clientId?: string },
  ) {
    const where: any = {};

    if (user.role === Role.TECHNICIEN) where.technicienId = user.id;
    if (user.role === Role.CLIENT) where.clientId = user.client?.id;

    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;

    if (filters?.clientId && user.role === Role.MANAGER)
      where.clientId = filters.clientId;

    return this.prisma.ticket.findMany({
      where,
      include: TICKET_INCLUDE,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string, user: any) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: TICKET_INCLUDE,
    });

    if (!ticket) throw new NotFoundException('Ticket introuvable');

    if (user.role === Role.TECHNICIEN && ticket.technicienId !== user.id)
      throw new ForbiddenException('Accès refusé');

    if (user.role === Role.CLIENT && ticket.client.userId !== user.id)
      throw new ForbiddenException('Accès refusé');

    return ticket;
  }

  async create(dto: CreateTicketDto, userId: string) {
    return this.prisma.ticket.create({
      data: {
        ...dto,
        createdById: userId,
      },
      include: TICKET_INCLUDE,
    });
  }

  async update(id: string, dto: UpdateTicketDto, user: any) {
    const ticket = await this.findOne(id, user);

    if (user.role === Role.TECHNICIEN) {
      const allowed = ['status', 'description'];
      const keys = Object.keys(dto).filter((k) => !allowed.includes(k));

      if (keys.length > 0)
        throw new ForbiddenException('Modification non autorisée');
    }

    const updated = await this.prisma.ticket.update({
      where: { id },
      data: dto,
      include: TICKET_INCLUDE,
    });

    if (dto.status === TicketStatus.EN_COURS && !updated.intervention) {
      await this.prisma.intervention.create({
        data: {
          ticketId: id,
          description: '',
          startedAt: new Date(),
        },
      });
    }

    return updated;
  }

  async assign(id: string, dto: AssignTicketDto) {
    return this.prisma.ticket.update({
      where: { id },
      data: {
        technicienId: dto.technicienId,
        status: TicketStatus.EN_COURS,
      },
      include: TICKET_INCLUDE,
    });
  }

  async remove(id: string) {
    await this.prisma.ticket.findUniqueOrThrow({
      where: { id },
    });

    return this.prisma.ticket.delete({
      where: { id },
    });
  }
}

