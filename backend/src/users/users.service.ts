// import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
// import * as bcrypt from 'bcryptjs';
// import { PrismaService } from '../prisma/prisma.service';
// import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
// import { Role } from '@prisma/client';

// @Injectable()
// export class UsersService {
//   constructor(private prisma: PrismaService) {}

//   async findAll(role?: Role) {
//     return this.prisma.user.findMany({
//       where: role ? { role } : undefined,
//       omit: { password: true },
//       include: { client: true },
//       orderBy: { createdAt: 'desc' },
//     });
//   }

//   async findOne(id: string) {
//     const user = await this.prisma.user.findUnique({
//       where: { id },
//       omit: { password: true },
//       include: {
//         client: true,
//         assignedTickets: {
//           include: { client: true },
//           orderBy: { createdAt: 'desc' },
//           take: 10,
//         },
//       },
//     });
//     if (!user) throw new NotFoundException('Utilisateur introuvable');
//     return user;
//   }

//   async create(dto: CreateUserDto) {
//     const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
//     if (exists) throw new ConflictException('Email déjà utilisé');

//     const hashed = await bcrypt.hash(dto.password, 12);
//     const user = await this.prisma.user.create({
//       data: { ...dto, password: hashed },
//       omit: { password: true },
//     });
//     return user;
//   }

//   async update(id: string, dto: UpdateUserDto) {
//     await this.findOne(id);
//     if (dto.password) dto.password = await bcrypt.hash(dto.password, 12);
//     return this.prisma.user.update({
//       where: { id },
//       data: dto,
//       omit: { password: true },
//     });
//   }

//   async remove(id: string) {
//     await this.findOne(id);
//     return this.prisma.user.update({
//       where: { id },
//       data: { isActive: false },
//       omit: { password: true },
//     });
//   }

//   async getTechniciens() {
//     return this.prisma.user.findMany({
//       where: { role: Role.TECHNICIEN, isActive: true },
//       omit: { password: true },
//       include: {
//         assignedTickets: {
//           where: { status: { in: ['NOUVEAU', 'EN_COURS'] } },
//         },
//       },
//     });
//   }
// }
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(role?: Role) {
    return this.prisma.user.findMany({
      where: role ? { role } : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        client: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        client: true,
        assignedTickets: {
          include: { client: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return user;
  }

  async create(dto: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (exists) throw new ConflictException('Email déjà utilisé');

    const hashed = await bcrypt.hash(dto.password, 12);

    return this.prisma.user.create({
      data: {
        ...dto,
        password: hashed,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 12);
    }

    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });
  }

  async getTechniciens() {
    return this.prisma.user.findMany({
      where: {
        role: Role.TECHNICIEN,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        assignedTickets: {
          where: {
            status: { in: ['NOUVEAU', 'EN_COURS'] },
          },
        },
      },
    });
  }
}
