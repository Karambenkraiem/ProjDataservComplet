import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
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
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

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
    const ticket = await this.prisma.ticket.create({
      data: { ...dto, createdById: userId },
      include: TICKET_INCLUDE,
    });

    // Notifier tous les managers
    const managers = await this.prisma.user.findMany({
      where: { role: Role.MANAGER, isActive: true },
      select: { id: true },
    });
    await Promise.all(
      managers.map((m) =>
        this.notifications.notify(
          m.id,
          'Nouveau ticket',
          `${ticket.client.user.name} a ouvert un ticket : "${ticket.title}"`,
          'ticket_created',
          ticket.id,
        ),
      ),
    );

    return ticket;
  }

  async update(id: string, dto: UpdateTicketDto, user: any) {
    await this.findOne(id, user);

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
    const ticket = await this.prisma.ticket.update({
      where: { id },
      data: {
        technicienId: dto.technicienId,
        status: TicketStatus.EN_COURS,
      },
      include: TICKET_INCLUDE,
    });

    // Notifier le technicien
    await this.notifications.notify(
      dto.technicienId,
      'Ticket assigné',
      `Le ticket "${ticket.title}" vous a été assigné (priorité : ${ticket.priority})`,
      'ticket_assigned',
      ticket.id,
    );

    // Notifier le client (via son userId)
    await this.notifications.notify(
      ticket.client.userId,
      'Ticket pris en charge',
      `Votre ticket "${ticket.title}" est pris en charge par ${ticket.technicien?.name ?? 'un technicien'}`,
      'ticket_taken',
      ticket.id,
    );

    return ticket;
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
