// import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
// import * as bcrypt from 'bcryptjs';
// import { PrismaService } from '../prisma/prisma.service';
// import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
// import { Role } from '@prisma/client';

// // Helper: strip password from user object
// function stripPassword<T extends { password: string }>(user: T): Omit<T, 'password'> {
//   const { password, ...rest } = user;
//   return rest;
// }

// @Injectable()
// export class UsersService {
//   constructor(private prisma: PrismaService) {}

//   async findAll(role?: Role) {
//     const users = await this.prisma.user.findMany({
//       where: role ? { role } : undefined,
//       include: { client: true },
//       orderBy: { createdAt: 'desc' },
//     });
//     return users.map(stripPassword);
//   }

//   async findOne(id: string) {
//     const user = await this.prisma.user.findUnique({
//       where: { id },
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
//     return stripPassword(user);
//   }

//   async create(dto: CreateUserDto) {
//     const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
//     if (exists) throw new ConflictException('Email déjà utilisé');
//     const hashed = await bcrypt.hash(dto.password, 12);
//     const user = await this.prisma.user.create({
//       data: { ...dto, password: hashed },
//     });
//     return stripPassword(user);
//   }

//   async update(id: string, dto: UpdateUserDto) {
//     await this.findOne(id);
//     if (dto.password) dto.password = await bcrypt.hash(dto.password, 12);
//     const user = await this.prisma.user.update({ where: { id }, data: dto });
//     return stripPassword(user);
//   }

//   async remove(id: string) {
//     await this.findOne(id);
//     const user = await this.prisma.user.update({
//       where: { id },
//       data: { isActive: false },
//     });
//     return stripPassword(user);
//   }

//   async getTechniciens() {
//     const users = await this.prisma.user.findMany({
//       where: { role: Role.TECHNICIEN, isActive: true },
//       include: {
//         assignedTickets: {
//           where: { status: { in: ['NOUVEAU', 'EN_COURS'] } },
//         },
//       },
//     });
//     return users.map(stripPassword);
//   }
// }

'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from '@/components/ui/toaster';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } })
  );
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
    </QueryClientProvider>
  );
}