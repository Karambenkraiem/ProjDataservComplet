// import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { ConfigService } from '@nestjs/config';
// import * as bcrypt from 'bcryptjs';
// import { PrismaService } from '../prisma/prisma.service';
// import { LoginDto } from './dto/auth.dto';

// @Injectable()
// export class AuthService {
//   constructor(
//     private prisma: PrismaService,
//     private jwtService: JwtService,
//     private configService: ConfigService,
//   ) {}

//   async login(dto: LoginDto) {
//     const user = await this.prisma.user.findUnique({
//       where: { email: dto.email },
//       include: { client: true },
//     });

//     if (!user) {
//       throw new UnauthorizedException('Identifiants incorrects');
//     }

//     const isPasswordValid = await bcrypt.compare(dto.password, user.password);
//     if (!isPasswordValid) {
//       throw new UnauthorizedException('Identifiants incorrects');
//     }

//     if (!user.isActive) {
//       throw new UnauthorizedException('Compte désactivé');
//     }

//     const payload = { sub: user.id, email: user.email, role: user.role };
//     const accessToken = this.jwtService.sign(payload);
//     const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

//     const { password, ...userWithoutPassword } = user;

//     return {
//       accessToken,
//       refreshToken,
//       user: userWithoutPassword,
//     };
//   }

//   async refresh(userId: string) {
//     const user = await this.prisma.user.findUnique({ where: { id: userId } });
//     if (!user) throw new UnauthorizedException();

//     const payload = { sub: user.id, email: user.email, role: user.role };
//     return { accessToken: this.jwtService.sign(payload) };
//   }

//   async getProfile(userId: string) {
//     const user = await this.prisma.user.findUnique({
//       where: { id: userId },
//       include: { client: true },
//       omit: { password: true },
//     });
//     return user;
//   }
// }

import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { client: true },
    });

    if (!user) {
      throw new UnauthorizedException('Identifiants incorrects');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants incorrects');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Compte désactivé');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    const { password, ...userWithoutPassword } = user;

    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword,
    };
  }

  async refresh(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { client: true },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }
}
