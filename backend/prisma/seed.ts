import { PrismaClient, Role, InterventionType, Priority, TicketStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Password123!', 12);

  // Manager
  const manager = await prisma.user.upsert({
    where: { email: 'manager@dataserv.tn' },
    update: {},
    create: {
      email: 'manager@dataserv.tn',
      password: hashedPassword,
      name: 'AMRI Aymen',
      phone: '+216 70 000 001',
      role: Role.MANAGER,
    },
  });

  // Technicien
  const tech1 = await prisma.user.upsert({
    where: { email: 'tech1@dataserv.tn' },
    update: {},
    create: {
      email: 'tech1@dataserv.tn',
      password: hashedPassword,
      name: 'Karim Mansour',
      phone: '+216 70 000 002',
      role: Role.TECHNICIEN,
    },
  });

  const tech2 = await prisma.user.upsert({
    where: { email: 'tech2@dataserv.tn' },
    update: {},
    create: {
      email: 'tech2@dataserv.tn',
      password: hashedPassword,
      name: 'Sonia Belhadj',
      phone: '+216 70 000 003',
      role: Role.TECHNICIEN,
    },
  });

  // Client 1 (contractuel)
  const clientUser1 = await prisma.user.upsert({
    where: { email: 'contact@alphabank.tn' },
    update: {},
    create: {
      email: 'contact@alphabank.tn',
      password: hashedPassword,
      name: 'Mohamed Ben Ali',
      role: Role.CLIENT,
    },
  });

  const client1 = await prisma.client.upsert({
    where: { userId: clientUser1.id },
    update: {},
    create: {
      userId: clientUser1.id,
      companyName: 'Alpha Bank',
      address: '12 Rue de la République, Tunis',
      isContractual: true,
      contractHours: 200,
      usedHours: 45,
      travelTimeMinutes: 30,
    },
  });

  // Client 2 (hors contrat)
  const clientUser2 = await prisma.user.upsert({
    where: { email: 'it@techcorp.tn' },
    update: {},
    create: {
      email: 'it@techcorp.tn',
      password: hashedPassword,
      name: 'Leila Trabelsi',
      role: Role.CLIENT,
    },
  });

  const client2 = await prisma.client.upsert({
    where: { userId: clientUser2.id },
    update: {},
    create: {
      userId: clientUser2.id,
      companyName: 'TechCorp SARL',
      address: '45 Avenue Habib Bourguiba, Sfax',
      isContractual: false,
      travelTimeMinutes: 60,
    },
  });

  // Tickets de démo
  await prisma.ticket.createMany({
    skipDuplicates: true,
    data: [
      {
        title: 'Panne serveur de messagerie',
        description: 'Le serveur Exchange ne répond plus depuis ce matin',
        status: TicketStatus.EN_COURS,
        type: InterventionType.SUR_SITE,
        priority: Priority.URGENT,
        clientId: client1.id,
        technicienId: tech1.id,
        createdById: manager.id,
      },
      {
        title: 'Installation antivirus postes',
        description: 'Déploiement antivirus sur 20 postes de travail',
        status: TicketStatus.NOUVEAU,
        type: InterventionType.SUR_SITE,
        priority: Priority.NORMAL,
        clientId: client1.id,
        technicienId: tech2.id,
        createdById: manager.id,
      },
      {
        title: 'Configuration VPN distant',
        description: 'Mise en place VPN pour les employés en télétravail',
        status: TicketStatus.RESOLU,
        type: InterventionType.DISTANCE,
        priority: Priority.NORMAL,
        clientId: client2.id,
        technicienId: tech1.id,
        createdById: clientUser2.id,
      },
    ],
  });

  console.log('✅ Seed terminé');
  console.log('📧 Manager: manager@dataserv.tn');
  console.log('📧 Tech 1: tech1@dataserv.tn');
  console.log('📧 Tech 2: tech2@dataserv.tn');
  console.log('📧 Client 1: contact@alphabank.tn');
  console.log('📧 Client 2: it@techcorp.tn');
  console.log('🔑 Mot de passe: Password123!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());