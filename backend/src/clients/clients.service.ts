// import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
// import * as bcrypt from 'bcryptjs';
// import { Role } from '@prisma/client';
// import { PrismaService } from '../prisma/prisma.service';
// import { CreateClientDto, UpdateClientDto } from './dto/client.dto';

// @Injectable()
// export class ClientsService {
//   constructor(private prisma: PrismaService) {}

//   async findAll() {
//     return this.prisma.client.findMany({
//       include: {
//         user: { omit: { password: true } },
//         tickets: { orderBy: { createdAt: 'desc' }, take: 5 },
//       },
//       orderBy: { createdAt: 'desc' },
//     });
//   }

//   async findOne(id: string) {
//     const client = await this.prisma.client.findUnique({
//       where: { id },
//       include: {
//         user: { omit: { password: true } },
//         tickets: {
//           include: { technicien: { omit: { password: true } }, intervention: true },
//           orderBy: { createdAt: 'desc' },
//         },
//       },
//     });
//     if (!client) throw new NotFoundException('Client introuvable');
//     return client;
//   }

//   async findByUserId(userId: string) {
//     return this.prisma.client.findUnique({
//       where: { userId },
//       include: {
//         user: { omit: { password: true } },
//         tickets: {
//           include: { technicien: { omit: { password: true } }, intervention: true },
//           orderBy: { createdAt: 'desc' },
//         },
//       },
//     });
//   }

//   async create(dto: CreateClientDto) {
//     const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
//     if (exists) throw new ConflictException('Email déjà utilisé');

//     const hashed = await bcrypt.hash(dto.password, 12);

//     return this.prisma.client.create({
//       data: {
//         companyName: dto.companyName,
//         address: dto.address,
//         isContractual: dto.isContractual ?? false,
//         contractHours: dto.contractHours,
//         travelTimeMinutes: dto.travelTimeMinutes ?? 0,
//         user: {
//           create: {
//             email: dto.email,
//             password: hashed,
//             name: dto.name,
//             phone: dto.phone,
//             role: Role.CLIENT,
//           },
//         },
//       },
//       include: { user: { omit: { password: true } } },
//     });
//   }

//   async update(id: string, dto: UpdateClientDto) {
//     const client = await this.findOne(id);

//     const { email, password, name, phone, companyName, address, isContractual, contractHours, travelTimeMinutes } = dto;

//     return this.prisma.client.update({
//       where: { id },
//       data: {
//         ...(companyName && { companyName }),
//         ...(address !== undefined && { address }),
//         ...(isContractual !== undefined && { isContractual }),
//         ...(contractHours !== undefined && { contractHours }),
//         ...(travelTimeMinutes !== undefined && { travelTimeMinutes }),
//         user: {
//           update: {
//             ...(email && { email }),
//             ...(password && { password: await bcrypt.hash(password, 12) }),
//             ...(name && { name }),
//             ...(phone && { phone }),
//           },
//         },
//       },
//       include: { user: { omit: { password: true } } },
//     });
//   }

//   async getStats(id: string) {
//     const client = await this.findOne(id);
//     const totalTickets = await this.prisma.ticket.count({ where: { clientId: id } });
//     const openTickets = await this.prisma.ticket.count({
//       where: { clientId: id, status: { in: ['NOUVEAU', 'EN_COURS'] } },
//     });

//     return {
//       client,
//       totalTickets,
//       openTickets,
//       usedHours: client.usedHours,
//       contractHours: client.contractHours,
//       remainingHours: client.contractHours ? client.contractHours - client.usedHours : null,
//     };
//   }
// }
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const clients = await this.prisma.client.findMany({
      include: {
        user: true,
        tickets: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
      orderBy: { createdAt: 'desc' },
    });

    return clients.map(c => {
      const { password, ...userWithoutPassword } = c.user;
      return { ...c, user: userWithoutPassword };
    });
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        user: true,
        tickets: {
          include: { technicien: true, intervention: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!client) throw new NotFoundException('Client introuvable');

    const { password, ...userWithoutPassword } = client.user;

    const tickets = client.tickets.map(t => {
      if (t.technicien) {
        const { password, ...techWithoutPassword } = t.technicien;
        return { ...t, technicien: techWithoutPassword };
      }
      return t;
    });

    return { ...client, user: userWithoutPassword, tickets };
  }

  async findByUserId(userId: string) {
    const client = await this.prisma.client.findUnique({
      where: { userId },
      include: {
        user: true,
        tickets: {
          include: { technicien: true, intervention: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!client) return null;

    const { password, ...userWithoutPassword } = client.user;

    const tickets = client.tickets.map(t => {
      if (t.technicien) {
        const { password, ...techWithoutPassword } = t.technicien;
        return { ...t, technicien: techWithoutPassword };
      }
      return t;
    });

    return { ...client, user: userWithoutPassword, tickets };
  }

  async create(dto: CreateClientDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (exists) throw new ConflictException('Email déjà utilisé');

    const hashed = await bcrypt.hash(dto.password, 12);

    const client = await this.prisma.client.create({
      data: {
        companyName: dto.companyName,
        address: dto.address,
        isContractual: dto.isContractual ?? false,
        contractHours: dto.contractHours,
        travelTimeMinutes: dto.travelTimeMinutes ?? 0,
        user: {
          create: {
            email: dto.email,
            password: hashed,
            name: dto.name,
            phone: dto.phone,
            role: Role.CLIENT,
          },
        },
      },
      include: { user: true },
    });

    const { password, ...userWithoutPassword } = client.user;

    return { ...client, user: userWithoutPassword };
  }

  async update(id: string, dto: UpdateClientDto) {
    await this.findOne(id);

    const {
      email,
      password,
      name,
      phone,
      companyName,
      address,
      isContractual,
      contractHours,
      travelTimeMinutes,
    } = dto;

    const client = await this.prisma.client.update({
      where: { id },
      data: {
        ...(companyName && { companyName }),
        ...(address !== undefined && { address }),
        ...(isContractual !== undefined && { isContractual }),
        ...(contractHours !== undefined && { contractHours }),
        ...(travelTimeMinutes !== undefined && { travelTimeMinutes }),
        user: {
          update: {
            ...(email && { email }),
            ...(password && { password: await bcrypt.hash(password, 12) }),
            ...(name && { name }),
            ...(phone && { phone }),
          },
        },
      },
      include: { user: true },
    });

    const { password: pw, ...userWithoutPassword } = client.user;

    return { ...client, user: userWithoutPassword };
  }

  async getStats(id: string) {
    const client = await this.findOne(id);

    const totalTickets = await this.prisma.ticket.count({
      where: { clientId: id },
    });

    const openTickets = await this.prisma.ticket.count({
      where: { clientId: id, status: { in: ['NOUVEAU', 'EN_COURS'] } },
    });

    return {
      client,
      totalTickets,
      openTickets,
      usedHours: client.usedHours,
      contractHours: client.contractHours,
      remainingHours: client.contractHours
        ? client.contractHours - client.usedHours
        : null,
    };
  }
}
