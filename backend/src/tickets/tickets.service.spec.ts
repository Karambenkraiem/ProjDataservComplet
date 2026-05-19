import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role, TicketStatus } from '@prisma/client';

const managerUser = { id: 'manager-1', role: Role.MANAGER };
const techUser    = { id: 'tech-1',    role: Role.TECHNICIEN };

const mockTicket = {
  id: 'ticket-1',
  title: 'Panne serveur',
  status: TicketStatus.NOUVEAU,
  technicienId: 'tech-1',
  client: { id: 'client-1', userId: 'client-user-1', user: {} },
  technicien: {},
  createdBy: {},
  intervention: null,
};

const mockPrisma = {
  ticket: {
    findMany:          jest.fn(),
    findUnique:        jest.fn(),
    findUniqueOrThrow: jest.fn(),
    create:            jest.fn(),
    update:            jest.fn(),
    delete:            jest.fn(),
  },
  intervention: {
    create: jest.fn(),
  },
};

describe('TicketsService', () => {
  let service: TicketsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('retourne tous les tickets pour un MANAGER', async () => {
      mockPrisma.ticket.findMany.mockResolvedValue([mockTicket]);

      const result = await service.findAll(managerUser);

      expect(result).toHaveLength(1);
      expect(mockPrisma.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });

    it('filtre par technicienId pour un TECHNICIEN', async () => {
      mockPrisma.ticket.findMany.mockResolvedValue([mockTicket]);

      await service.findAll(techUser);

      expect(mockPrisma.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { technicienId: techUser.id } }),
      );
    });

    it('filtre par status si fourni', async () => {
      mockPrisma.ticket.findMany.mockResolvedValue([]);

      await service.findAll(managerUser, { status: TicketStatus.EN_COURS });

      expect(mockPrisma.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: TicketStatus.EN_COURS } }),
      );
    });
  });

  describe('findOne', () => {
    it('retourne un ticket existant pour le MANAGER', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue(mockTicket);

      const result = await service.findOne('ticket-1', managerUser);

      expect(result.id).toBe('ticket-1');
    });

    it("lève NotFoundException si le ticket n'existe pas", async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue(null);

      await expect(service.findOne('inexistant', managerUser))
        .rejects.toThrow(NotFoundException);
    });

    it("lève ForbiddenException si le TECHNICIEN n'est pas assigné", async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue(mockTicket);
      const autretech = { id: 'tech-999', role: Role.TECHNICIEN };

      await expect(service.findOne('ticket-1', autretech))
        .rejects.toThrow(ForbiddenException);
    });

    it("lève ForbiddenException si le CLIENT n'est pas propriétaire", async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue(mockTicket);
      const autreClient = { id: 'client-user-999', role: Role.CLIENT };

      await expect(service.findOne('ticket-1', autreClient))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('create', () => {
    it('crée un ticket avec createdById', async () => {
      const dto = { title: 'Nouveau', description: 'desc', type: 'SUR_SITE', priority: 'NORMAL', clientId: 'client-1' };
      mockPrisma.ticket.create.mockResolvedValue({ ...mockTicket, ...dto });

      const result = await service.create(dto as any, 'manager-1');

      expect(mockPrisma.ticket.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ createdById: 'manager-1' }) }),
      );
      expect(result.title).toBe('Nouveau');
    });
  });

  describe('update', () => {
    it('met à jour un ticket pour le MANAGER', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue(mockTicket);
      mockPrisma.ticket.update.mockResolvedValue({ ...mockTicket, status: TicketStatus.EN_COURS, intervention: {} });

      const result = await service.update('ticket-1', { status: TicketStatus.EN_COURS } as any, managerUser);

      expect(result.status).toBe(TicketStatus.EN_COURS);
    });

    it('lève ForbiddenException si TECHNICIEN modifie un champ non autorisé', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue(mockTicket);

      await expect(service.update('ticket-1', { priority: 'URGENT' } as any, techUser))
        .rejects.toThrow(ForbiddenException);
    });

    it("crée une intervention quand le status passe à EN_COURS sans intervention existante", async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue(mockTicket);
      mockPrisma.ticket.update.mockResolvedValue({ ...mockTicket, status: TicketStatus.EN_COURS, intervention: null });
      mockPrisma.intervention.create.mockResolvedValue({});

      await service.update('ticket-1', { status: TicketStatus.EN_COURS } as any, managerUser);

      expect(mockPrisma.intervention.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ ticketId: 'ticket-1' }) }),
      );
    });
  });

  describe('assign', () => {
    it('assigne un technicien et passe le status à EN_COURS', async () => {
      mockPrisma.ticket.update.mockResolvedValue({ ...mockTicket, technicienId: 'tech-2', status: TicketStatus.EN_COURS });

      const result = await service.assign('ticket-1', { technicienId: 'tech-2' });

      expect(mockPrisma.ticket.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { technicienId: 'tech-2', status: TicketStatus.EN_COURS },
        }),
      );
      expect(result.status).toBe(TicketStatus.EN_COURS);
    });
  });

  describe('remove', () => {
    it('supprime un ticket existant', async () => {
      mockPrisma.ticket.findUniqueOrThrow.mockResolvedValue(mockTicket);
      mockPrisma.ticket.delete.mockResolvedValue(mockTicket);

      const result = await service.remove('ticket-1');

      expect(mockPrisma.ticket.delete).toHaveBeenCalledWith({ where: { id: 'ticket-1' } });
      expect(result.id).toBe('ticket-1');
    });

    it("lève une erreur si le ticket n'existe pas", async () => {
      mockPrisma.ticket.findUniqueOrThrow.mockRejectedValue(new Error('Not found'));

      await expect(service.remove('inexistant')).rejects.toThrow();
    });
  });
});
