import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketStatus, Role } from '@prisma/client';

const isActiveStatus = (status: TicketStatus) =>
  status === TicketStatus.NOUVEAU || status === TicketStatus.EN_COURS;

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getManagerStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [
      totalTickets,
      nouveaux,
      enCours,
      resolus,
      clotures,
      urgents,
      todayTickets,
      weekTickets,
      techniciens,
      clients,
    ] = await Promise.all([
      this.prisma.ticket.count(),

      this.prisma.ticket.count({
        where: { status: TicketStatus.NOUVEAU },
      }),

      this.prisma.ticket.count({
        where: { status: TicketStatus.EN_COURS },
      }),

      this.prisma.ticket.count({
        where: { status: TicketStatus.RESOLU },
      }),

      this.prisma.ticket.count({
        where: { status: TicketStatus.CLOTURE },
      }),

      this.prisma.ticket.count({
        where: {
          priority: 'URGENT',
          status: {
            in: [TicketStatus.NOUVEAU, TicketStatus.EN_COURS] as TicketStatus[],
          },
        },
      }),

      this.prisma.ticket.count({
        where: { createdAt: { gte: today } },
      }),

      this.prisma.ticket.count({
        where: { createdAt: { gte: weekAgo } },
      }),

      this.prisma.user.findMany({
        where: { role: Role.TECHNICIEN, isActive: true },
        select: {
          id: true,
          email: true,
          role: true,
          assignedTickets: {
            where: {
              status: {
                in: [TicketStatus.NOUVEAU, TicketStatus.EN_COURS] as TicketStatus[],
              },
            },
            select: { id: true, priority: true, status: true },
          },
        },
      }),

      this.prisma.client.findMany({
        where: { isContractual: true },
        include: {
          user: { select: { id: true, email: true } },
        },
        take: 5,
        orderBy: { usedHours: 'desc' },
      }),
    ]);

    const recentTickets = await this.prisma.ticket.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          include: { user: { select: { id: true, email: true } } },
        },
        technicien: { select: { id: true, email: true } },
      },
    });

    return {
      stats: { totalTickets, nouveaux, enCours, resolus, clotures, urgents, todayTickets, weekTickets },
      techniciens: techniciens.map((t) => ({
        ...t,
        activeTickets: t.assignedTickets.length,
        urgentTickets: t.assignedTickets.filter((tk) => tk.priority === 'URGENT').length,
      })),
      topClients: clients,
      recentTickets,
    };
  }

  async getTechnicienStats(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [myTickets, todayDone, totalHours] = await Promise.all([
      this.prisma.ticket.findMany({
        where: {
          technicienId: userId,
          status: {
            in: [TicketStatus.NOUVEAU, TicketStatus.EN_COURS] as TicketStatus[],
          },
        },
        include: {
          client: {
            include: { user: { select: { id: true, email: true } } },
          },
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
      }),

      this.prisma.ticket.count({
        where: { technicienId: userId, status: TicketStatus.RESOLU, updatedAt: { gte: today } },
      }),

      this.prisma.intervention.aggregate({
        where: { ticket: { technicienId: userId } },
        _sum: { hoursWorked: true },
      }),
    ]);

    return {
      myTickets,
      todayDone,
      totalHours: totalHours._sum.hoursWorked ?? 0,
      urgentCount: myTickets.filter((t) => t.priority === 'URGENT').length,
    };
  }

  async getClientStats(clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: { user: { select: { id: true, email: true } } },
    });

    const tickets = await this.prisma.ticket.findMany({
      where: { clientId },
      include: {
        technicien: { select: { id: true, email: true } },
        intervention: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const openCount = tickets.filter((t) => isActiveStatus(t.status)).length;
    const closedCount = tickets.filter((t) => t.status === TicketStatus.CLOTURE).length;

    return { client, tickets, openCount, closedCount };
  }
}
