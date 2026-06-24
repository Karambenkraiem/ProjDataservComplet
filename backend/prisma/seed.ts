import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const alreadySeeded = await prisma.user.findFirst();
  if (alreadySeeded) {
    console.log('⏭️  Seed déjà effectué — aucune donnée ajoutée.');
    return;
  }

  const hashedPassword = await bcrypt.hash('Password123!', 12);

  // Manager
  await prisma.user.upsert({
    where: { email: 'manager@dataserv.tn' },
    update: {},
    create: {
      email: 'manager@dataserv.tn',
      password: hashedPassword,
      name: 'Aymen Amri',
      phone: '+216 70 000 001',
      role: Role.MANAGER,
    },
  });

  // Techniciens
  await prisma.user.upsert({
    where: { email: 'karam@dataserv.tn' },
    update: {},
    create: {
      email: 'karam@dataserv.tn',
      password: hashedPassword,
      name: 'Karam Ben Kraiem',
      phone: '+216 70 000 002',
      role: Role.TECHNICIEN,
    },
  });

  await prisma.user.upsert({
    where: { email: 'khaireddine@dataserv.tn' },
    update: {},
    create: {
      email: 'khaireddine@dataserv.tn',
      password: hashedPassword,
      name: 'Khaireddine Mhamdi',
      phone: '+216 70 000 003',
      role: Role.TECHNICIEN,
    },
  });

  // Client 1 — Polina Group (contractuel)
  const clientUser1 = await prisma.user.upsert({
    where: { email: 'contact@polinagroup.tn' },
    update: {},
    create: {
      email: 'contact@polinagroup.tn',
      password: hashedPassword,
      name: 'Hedi Ben Ayed',
      role: Role.CLIENT,
    },
  });

  await prisma.client.upsert({
    where: { userId: clientUser1.id },
    update: {},
    create: {
      userId: clientUser1.id,
      companyName: 'Polina Group',
      address: 'Tunis, Tunisie',
      isContractual: true,
      contractHours: 200,
      usedHours: 0,
      travelTimeMinutes: 30,
    },
  });

  // Client 2 — Delice Holding (non contractuel)
  const clientUser2 = await prisma.user.upsert({
    where: { email: 'contact@delice.tn' },
    update: {},
    create: {
      email: 'contact@delice.tn',
      password: hashedPassword,
      name: 'Hamdi Ben Meddeb',
      role: Role.CLIENT,
    },
  });

  await prisma.client.upsert({
    where: { userId: clientUser2.id },
    update: {},
    create: {
      userId: clientUser2.id,
      companyName: 'Delice Holding',
      address: 'Tunis, Tunisie',
      isContractual: false,
      travelTimeMinutes: 45,
    },
  });

  console.log('✅ Seed terminé — application vierge');
  console.log('📧 Manager     : manager@dataserv.tn');
  console.log('📧 Technicien 1: karam@dataserv.tn');
  console.log('📧 Technicien 2: khaireddine@dataserv.tn');
  console.log('📧 Client 1    : contact@polinagroup.tn  (Polina Group)');
  console.log('📧 Client 2    : contact@delice.tn       (Delice Holding)');
  console.log('🔑 Mot de passe: Password123!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
