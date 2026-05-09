import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, TicketStatus } from '@prisma/client';

const ACTIVE: TicketStatus[] = [TicketStatus.NOUVEAU, TicketStatus.EN_COURS];
const DONE: TicketStatus[] = [TicketStatus.RESOLU, TicketStatus.CLOTURE];

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  isActive: true,
  createdAt: true,
} as const;

@Injectable()
export class TechniciensService {
  constructor(private prisma: PrismaService) {}

  async getRendement() {
    const techniciens = await this.prisma.user.findMany({
      where: { role: Role.TECHNICIEN },
      select: {
        ...USER_SELECT,
        assignedTickets: {
          select: {
            id: true,
            status: true,
            priority: true,
            intervention: {
              select: { hoursWorked: true, travelMinutes: true, closedAt: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return techniciens.map((t) => {
      const tickets = t.assignedTickets;
      const total = tickets.length;
      const actifs = tickets.filter((tk) => ACTIVE.includes(tk.status)).length;
      const termines = tickets.filter((tk) => DONE.includes(tk.status)).length;
      const urgents = tickets.filter((tk) => tk.priority === 'URGENT').length;

      const totalHeures = tickets.reduce(
        (sum, tk) => sum + (tk.intervention?.hoursWorked ?? 0),
        0,
      );
      const totalDeplacementsMin = tickets.reduce(
        (sum, tk) => sum + (tk.intervention?.travelMinutes ?? 0),
        0,
      );

      return {
        id: t.id,
        name: t.name,
        email: t.email,
        phone: t.phone,
        isActive: t.isActive,
        stats: {
          totalTickets: total,
          actifs,
          termines,
          urgents,
          tauxResolution: total > 0 ? Math.round((termines / total) * 100) : 0,
          totalHeures: Math.round(totalHeures * 100) / 100,
          totalDeplacementsMin,
        },
      };
    });
  }

  async getOneTechnicien(id: string) {
    const technicien = await this.prisma.user.findUnique({
      where: { id, role: Role.TECHNICIEN },
      select: USER_SELECT,
    });

    if (!technicien) throw new NotFoundException('Technicien introuvable');

    const [tickets, aggregation] = await Promise.all([
      this.prisma.ticket.findMany({
        where: { technicienId: id },
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          type: true,
          createdAt: true,
          updatedAt: true,
          client: {
            select: {
              id: true,
              companyName: true,
              user: { select: { name: true, email: true } },
            },
          },
          intervention: {
            select: {
              hoursWorked: true,
              travelMinutes: true,
              startedAt: true,
              closedAt: true,
              resolution: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),

      this.prisma.intervention.aggregate({
        where: { ticket: { technicienId: id } },
        _sum: { hoursWorked: true, travelMinutes: true },
        _count: { id: true },
      }),
    ]);

    const total = tickets.length;
    const actifs = tickets.filter((t) => ACTIVE.includes(t.status)).length;
    const termines = tickets.filter((t) => DONE.includes(t.status)).length;
    const urgents = tickets.filter((t) => t.priority === 'URGENT').length;
    const totalHeures = aggregation._sum.hoursWorked ?? 0;
    const totalDeplacementsMin = aggregation._sum.travelMinutes ?? 0;

    const ticketsMoisCourant = tickets.filter((t) => {
      const d = new Date(t.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    return {
      technicien,
      stats: {
        totalTickets: total,
        actifs,
        termines,
        urgents,
        tauxResolution: total > 0 ? Math.round((termines / total) * 100) : 0,
        totalHeures: Math.round(totalHeures * 100) / 100,
        totalDeplacementsMin,
        ticketsMoisCourant,
      },
      tickets,
    };
  }
}
