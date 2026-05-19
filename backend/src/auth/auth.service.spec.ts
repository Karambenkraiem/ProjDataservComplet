import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

const mockUser = {
  id: 'user-1',
  email: 'manager@dataserv.tn',
  password: 'hashed_password',
  name: 'AMRI Aymen',
  role: 'MANAGER',
  isActive: true,
  client: null,
};

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
  },
};

const mockJwt = {
  sign: jest.fn().mockReturnValue('mock_token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: {} },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('retourne les tokens et le profil pour des identifiants valides', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.login({ email: mockUser.email, password: 'Password123!' });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).not.toHaveProperty('password');
      expect(result.user.email).toBe(mockUser.email);
    });

    it("lève UnauthorizedException si l'email n'existe pas", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login({ email: 'inconnu@test.tn', password: 'xxx' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('lève UnauthorizedException si le mot de passe est incorrect', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.login({ email: mockUser.email, password: 'mauvais' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('lève UnauthorizedException si le compte est désactivé', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ ...mockUser, isActive: false });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      await expect(service.login({ email: mockUser.email, password: 'Password123!' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('retourne un nouvel accessToken pour un userId valide', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.refresh('user-1');

      expect(result).toHaveProperty('accessToken');
      expect(mockJwt.sign).toHaveBeenCalledTimes(1);
    });

    it('lève UnauthorizedException si le user est introuvable', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.refresh('inexistant')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('retourne le profil sans le mot de passe', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getProfile('user-1');

      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe(mockUser.email);
    });

    it('lève UnauthorizedException si le user est introuvable', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('inexistant')).rejects.toThrow(UnauthorizedException);
    });
  });
});
