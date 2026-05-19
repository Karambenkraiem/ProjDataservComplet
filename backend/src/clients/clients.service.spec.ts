import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { ClientsService } from './clients.service';
import { PrismaService } from '../prisma/prisma.service';

const mockUserData = {
  id: 'user-1',
  email: 'contact@alphabank.tn',
  password: 'hashed',
  name: 'Mohamed Ben Ali',
  role: 'CLIENT',
  isActive: true,
  phone: null,
};

const mockClient = {
  id: 'client-1',
  userId: 'user-1',
  companyName: 'Alpha Bank',
  address: 'Tunis',
  isContractual: true,
  contractHours: 200,
  usedHours: 45,
  travelTimeMinutes: 30,
  user: mockUserData,
  tickets: [],
};

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
  },
  client: {
    findMany:  jest.fn(),
    findUnique: jest.fn(),
    create:    jest.fn(),
    update:    jest.fn(),
  },
  ticket: {
    count: jest.fn(),
  },
};

describe('ClientsService', () => {
  let service: ClientsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('retourne les clients sans le champ password', async () => {
      mockPrisma.client.findMany.mockResolvedValue([mockClient]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].user).not.toHaveProperty('password');
    });
  });

  describe('findOne', () => {
    it('retourne un client existant sans mot de passe', async () => {
      mockPrisma.client.findUnique.mockResolvedValue({ ...mockClient, tickets: [] });

      const result = await service.findOne('client-1');

      expect(result.id).toBe('client-1');
      expect(result.user).not.toHaveProperty('password');
    });

    it("lève NotFoundException si le client n'existe pas", async () => {
      mockPrisma.client.findUnique.mockResolvedValue(null);

      await expect(service.findOne('inexistant')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUserId', () => {
    it('retourne null si aucun client trouvé', async () => {
      mockPrisma.client.findUnique.mockResolvedValue(null);

      const result = await service.findByUserId('user-999');

      expect(result).toBeNull();
    });

    it('retourne le client sans mot de passe', async () => {
      mockPrisma.client.findUnique.mockResolvedValue({ ...mockClient, tickets: [] });

      const result = await service.findByUserId('user-1');

      expect(result).not.toBeNull();
      expect(result!.user).not.toHaveProperty('password');
    });
  });

  describe('create', () => {
    const dto = {
      email: 'nouveau@client.tn',
      password: 'Password123!',
      name: 'Nouveau Client',
      companyName: 'NewCorp',
      address: 'Sfax',
      isContractual: false,
      travelTimeMinutes: 0,
    };

    it('crée un client et retourne le profil sans mot de passe', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed_pw' as never);
      mockPrisma.client.create.mockResolvedValue({ ...mockClient, user: { ...mockUserData, email: dto.email } });

      const result = await service.create(dto as any);

      expect(result.user).not.toHaveProperty('password');
      expect(mockPrisma.client.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ companyName: dto.companyName }),
        }),
      );
    });

    it("lève ConflictException si l'email est déjà utilisé", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUserData);

      await expect(service.create(dto as any)).rejects.toThrow(ConflictException);
      expect(mockPrisma.client.create).not.toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('retourne les statistiques du client', async () => {
      mockPrisma.client.findUnique.mockResolvedValue({ ...mockClient, tickets: [] });
      mockPrisma.ticket.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(3);

      const result = await service.getStats('client-1');

      expect(result.totalTickets).toBe(10);
      expect(result.openTickets).toBe(3);
      expect(result.usedHours).toBe(45);
      expect(result.remainingHours).toBe(155);
    });

    it('retourne remainingHours null si client non contractuel', async () => {
      const nonContractual = { ...mockClient, isContractual: false, contractHours: null, tickets: [] };
      mockPrisma.client.findUnique.mockResolvedValue(nonContractual);
      mockPrisma.ticket.count.mockResolvedValue(0);

      const result = await service.getStats('client-1');

      expect(result.remainingHours).toBeNull();
    });
  });
});
