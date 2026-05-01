// import { Injectable, NotFoundException } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';
// import { UpdateInterventionDto, CloseInterventionDto } from './dto/intervention.dto';
// import { TicketStatus } from '@prisma/client';
// import * as PDFDocument from 'pdfkit';
// import * as fs from 'fs';
// import * as path from 'path';

// @Injectable()
// export class InterventionsService {
//   constructor(private prisma: PrismaService) {}

//   private get uploadsDir() {
//     const dir = path.join(process.cwd(), 'uploads', 'interventions');
//     if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
//     return dir;
//   }

//   async findOne(ticketId: string) {
//     const intervention = await this.prisma.intervention.findUnique({
//       where: { ticketId },
//       include: {
//         ticket: {
//           include: {
//             client: { include: { user: { omit: { password: true } } } },
//             technicien: { omit: { password: true } },
//           },
//         },
//       },
//     });
//     if (!intervention) throw new NotFoundException('Fiche d\'intervention introuvable');
//     return intervention;
//   }

//   async update(ticketId: string, dto: UpdateInterventionDto) {
//     await this.findOne(ticketId);
//     return this.prisma.intervention.update({
//       where: { ticketId },
//       data: dto,
//     });
//   }

//   async close(ticketId: string, dto: CloseInterventionDto) {
//     const intervention = await this.findOne(ticketId);

//     // Générer le PDF
//     const pdfFilename = `intervention-${ticketId}-${Date.now()}.pdf`;
//     const pdfPath = path.join(this.uploadsDir, pdfFilename);
//     await this.generatePdf(intervention, dto, pdfPath);

//     // Mettre à jour l'intervention
//     const updated = await this.prisma.intervention.update({
//       where: { ticketId },
//       data: {
//         ...dto,
//         pdfUrl: `/uploads/interventions/${pdfFilename}`,
//         closedAt: new Date(),
//         sentToClient: false,
//       },
//     });

//     // Mettre à jour le statut du ticket + heures client
//     await this.prisma.ticket.update({
//       where: { id: ticketId },
//       data: { status: TicketStatus.RESOLU },
//     });

//     // Mettre à jour les heures consommées du client
//     const ticket = intervention.ticket as any;
//     if (ticket.client) {
//       await this.prisma.client.update({
//         where: { id: ticket.clientId },
//         data: { usedHours: { increment: dto.hoursWorked } },
//       });
//     }

//     return updated;
//   }

//   private generatePdf(intervention: any, dto: CloseInterventionDto, outputPath: string): Promise<void> {
//     return new Promise((resolve, reject) => {
//       const doc = new PDFDocument({ margin: 50 });
//       const stream = fs.createWriteStream(outputPath);
//       doc.pipe(stream);

//       const ticket = intervention.ticket;
//       const client = ticket.client;
//       const tech = ticket.technicien;

//       // En-tête
//       doc.fontSize(22).font('Helvetica-Bold').text('DataServ', { align: 'center' });
//       doc.fontSize(14).font('Helvetica').text('Fiche d\'Intervention Technique', { align: 'center' });
//       doc.moveDown();
//       doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
//       doc.moveDown();

//       // Infos ticket
//       doc.fontSize(12).font('Helvetica-Bold').text('Informations du ticket');
//       doc.font('Helvetica')
//         .text(`Référence : #${ticket.id.slice(0, 8).toUpperCase()}`)
//         .text(`Titre : ${ticket.title}`)
//         .text(`Type : ${ticket.type === 'SUR_SITE' ? 'Sur site' : 'À distance'}`)
//         .text(`Priorité : ${ticket.priority}`)
//         .text(`Date création : ${new Date(ticket.createdAt).toLocaleDateString('fr-TN')}`)
//         .text(`Date clôture : ${new Date().toLocaleDateString('fr-TN')}`);

//       doc.moveDown();

//       // Client
//       doc.font('Helvetica-Bold').text('Client');
//       doc.font('Helvetica')
//         .text(`Société : ${client.companyName}`)
//         .text(`Contact : ${client.user.name}`)
//         .text(`Email : ${client.user.email}`);

//       doc.moveDown();

//       // Technicien
//       doc.font('Helvetica-Bold').text('Technicien');
//       doc.font('Helvetica')
//         .text(`Nom : ${tech?.name || 'N/A'}`)
//         .text(`Email : ${tech?.email || 'N/A'}`);

//       doc.moveDown();

//       // Intervention
//       doc.font('Helvetica-Bold').text('Détails de l\'intervention');
//       doc.font('Helvetica')
//         .text(`Description :`)
//         .text(dto.description, { indent: 20 });

//       if (dto.resolution) {
//         doc.moveDown(0.5).text('Résolution :').text(dto.resolution, { indent: 20 });
//       }

//       doc.moveDown();

//       // Temps
//       doc.font('Helvetica-Bold').text('Temps passé');
//       doc.font('Helvetica')
//         .text(`Heures travaillées : ${dto.hoursWorked}h`)
//         .text(`Temps de déplacement : ${dto.travelMinutes} min`);

//       doc.moveDown(2);

//       // Signatures
//       doc.font('Helvetica-Bold').text('Signatures', { align: 'center' });
//       doc.moveDown();
//       doc.font('Helvetica');

//       const sigY = doc.y;
//       doc.text('Technicien :', 100, sigY);
//       doc.text('Client :', 350, sigY);
//       doc.rect(100, sigY + 20, 150, 60).stroke();
//       doc.rect(350, sigY + 20, 150, 60).stroke();

//       doc.end();
//       stream.on('finish', resolve);
//       stream.on('error', reject);
//     });
//   }
// }

// import { Injectable, NotFoundException } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';
// import { UpdateInterventionDto, CloseInterventionDto } from './dto/intervention.dto';
// import { TicketStatus } from '@prisma/client';
// import * as PDFDocument from 'pdfkit';
// import * as fs from 'fs';
// import * as path from 'path';

// @Injectable()
// export class InterventionsService {
//   constructor(private prisma: PrismaService) {}

//   private get uploadsDir() {
//     const dir = path.join(process.cwd(), 'uploads', 'interventions');
//     if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
//     return dir;
//   }

//   async findOne(ticketId: string) {
//     const intervention = await this.prisma.intervention.findUnique({
//       where: { ticketId },
//       include: {
//         ticket: {
//           include: {
//             client: {
//               include: {
//                 user: {
//                   select: {
//                     id: true,
//                     name: true,
//                     email: true,
//                   },
//                 },
//               },
//             },
//             technicien: {
//               select: {
//                 id: true,
//                 name: true,
//                 email: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     if (!intervention) {
//       throw new NotFoundException("Fiche d'intervention introuvable");
//     }

//     return intervention;
//   }

//   async update(ticketId: string, dto: UpdateInterventionDto) {
//     await this.findOne(ticketId);

//     return this.prisma.intervention.update({
//       where: { ticketId },
//       data: dto,
//     });
//   }

//   async close(ticketId: string, dto: CloseInterventionDto) {
//     const intervention = await this.findOne(ticketId);

//     const ticket = intervention.ticket;

//     if (!ticket) {
//       throw new NotFoundException('Ticket introuvable');
//     }

//     // Générer le PDF
//     const pdfFilename = `intervention-${ticketId}-${Date.now()}.pdf`;
//     const pdfPath = path.join(this.uploadsDir, pdfFilename);

//     await this.generatePdf(intervention, dto, pdfPath);

//     // update intervention
//     const updated = await this.prisma.intervention.update({
//       where: { ticketId },
//       data: {
//         ...dto,
//         pdfUrl: `/uploads/interventions/${pdfFilename}`,
//         closedAt: new Date(),
//         sentToClient: false,
//       },
//     });

//     // update ticket status (FIX IMPORTANT)
//     await this.prisma.ticket.update({
//       where: { id: intervention.ticketId },
//       data: { status: TicketStatus.RESOLU },
//     });

//     // update client hours (SAFE CHECK)
//     if (ticket.clientId) {
//       await this.prisma.client.update({
//         where: { id: ticket.clientId },
//         data: {
//           usedHours: {
//             increment: dto.hoursWorked,
//           },
//         },
//       });
//     }

//     return updated;
//   }

//   private generatePdf(
//     intervention: any,
//     dto: CloseInterventionDto,
//     outputPath: string,
//   ): Promise<void> {
//     return new Promise((resolve, reject) => {
//       const doc = new PDFDocument({ margin: 50 });
//       const stream = fs.createWriteStream(outputPath);

//       doc.pipe(stream);

//       const ticket = intervention.ticket;
//       const client = ticket.client;
//       const tech = ticket.technicien;

//       // HEADER
//       doc.fontSize(22).font('Helvetica-Bold').text('DataServ', { align: 'center' });
//       doc.fontSize(14).font('Helvetica').text('Fiche d\'Intervention Technique', { align: 'center' });
//       doc.moveDown();
//       doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
//       doc.moveDown();

//       // TICKET INFO
//       doc.fontSize(12).font('Helvetica-Bold').text('Informations du ticket');
//       doc.font('Helvetica')
//         .text(`Référence : #${ticket.id.slice(0, 8).toUpperCase()}`)
//         .text(`Titre : ${ticket.title}`)
//         .text(`Type : ${ticket.type === 'SUR_SITE' ? 'Sur site' : 'À distance'}`)
//         .text(`Priorité : ${ticket.priority}`)
//         .text(`Créé le : ${new Date(ticket.createdAt).toLocaleDateString('fr-TN')}`)
//         .text(`Clôturé le : ${new Date().toLocaleDateString('fr-TN')}`);

//       doc.moveDown();

//       // CLIENT
//       doc.font('Helvetica-Bold').text('Client');
//       doc.font('Helvetica')
//         .text(`Société : ${client.companyName}`)
//         .text(`Contact : ${client.user.name}`)
//         .text(`Email : ${client.user.email}`);

//       doc.moveDown();

//       // TECHNICIEN
//       doc.font('Helvetica-Bold').text('Technicien');
//       doc.font('Helvetica')
//         .text(`Nom : ${tech?.name ?? 'N/A'}`)
//         .text(`Email : ${tech?.email ?? 'N/A'}`);

//       doc.moveDown();

//       // INTERVENTION
//       doc.font('Helvetica-Bold').text('Intervention');
//       doc.font('Helvetica')
//         .text(dto.description)
//         .moveDown();

//       if (dto.resolution) {
//         doc.text('Résolution:');
//         doc.text(dto.resolution);
//       }

//       doc.moveDown();

//       // TEMPS
//       doc.font('Helvetica-Bold').text('Temps');
//       doc.font('Helvetica')
//         .text(`Heures: ${dto.hoursWorked}`)
//         .text(`Déplacement: ${dto.travelMinutes} min`);

//       doc.end();

//       stream.on('finish', resolve);
//       stream.on('error', reject);
//     });
//   }
// }


///////////////////////////////////////////


import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateInterventionDto, CloseInterventionDto } from './dto/intervention.dto';
import { TicketStatus } from '@prisma/client';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

const INTERVENTION_INCLUDE = {
  ticket: {
    include: {
      client: { include: { user: true } },
      technicien: true,
    },
  },
};

function sanitize(intervention: any) {
  if (!intervention) return intervention;
  if (intervention.ticket?.client?.user?.password) {
    const { password, ...u } = intervention.ticket.client.user;
    intervention.ticket.client.user = u;
  }
  if (intervention.ticket?.technicien?.password) {
    const { password, ...t } = intervention.ticket.technicien;
    intervention.ticket.technicien = t;
  }
  return intervention;
}

@Injectable()
export class InterventionsService {
  constructor(private prisma: PrismaService) {}

  private get uploadsDir() {
    const dir = path.join(process.cwd(), 'uploads', 'interventions');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
  }

  async findOne(ticketId: string) {
    const intervention = await this.prisma.intervention.findUnique({
      where: { ticketId },
      include: INTERVENTION_INCLUDE,
    });
    if (!intervention) throw new NotFoundException("Fiche d'intervention introuvable");
    return sanitize(intervention);
  }

  async update(ticketId: string, dto: UpdateInterventionDto) {
    // Crée la fiche si elle n'existe pas
    const existing = await this.prisma.intervention.findUnique({ where: { ticketId } });
    if (!existing) {
      await this.prisma.intervention.create({
        data: { ticketId, description: '', startedAt: new Date() },
      });
    }
    return this.prisma.intervention.update({
      where: { ticketId },
      data: dto,
    });
  }

  async close(ticketId: string, dto: CloseInterventionDto) {
    // Récupère ou crée la fiche d'intervention
    let intervention = await this.prisma.intervention.findUnique({
      where: { ticketId },
      include: INTERVENTION_INCLUDE,
    });

    if (!intervention) {
      intervention = await this.prisma.intervention.create({
        data: { ticketId, description: '', startedAt: new Date() },
        include: INTERVENTION_INCLUDE,
      });
    }

    // Générer le PDF
    const pdfFilename = `intervention-${ticketId}-${Date.now()}.pdf`;
    const pdfPath = path.join(this.uploadsDir, pdfFilename);
    await this.generatePdf(sanitize({ ...intervention }), dto, pdfPath);

    // Mettre à jour l'intervention
    const updated = await this.prisma.intervention.update({
      where: { ticketId },
      data: {
        description: dto.description,
        resolution: dto.resolution,
        hoursWorked: dto.hoursWorked,
        travelMinutes: dto.travelMinutes,
        pdfUrl: `/uploads/interventions/${pdfFilename}`,
        closedAt: new Date(),
        sentToClient: false,
      },
    });

    // Mettre à jour le statut du ticket
    const ticket = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { status: TicketStatus.RESOLU },
      include: { client: true },
    });

    // Mettre à jour les heures consommées du client
    if (ticket?.client) {
      await this.prisma.client.update({
        where: { id: ticket.clientId },
        data: { usedHours: { increment: dto.hoursWorked } },
      });
    }

    return updated;
  }

  private generatePdf(
    intervention: any,
    dto: CloseInterventionDto,
    outputPath: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      const ticket = intervention.ticket || {};
      const client = ticket.client || {};
      const tech = ticket.technicien || null;

      // En-tête
      doc.fontSize(22).font('Helvetica-Bold').text('DataServ', { align: 'center' });
      doc
        .fontSize(14)
        .font('Helvetica')
        .text("Fiche d'Intervention Technique", { align: 'center' });
      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      // Infos ticket
      doc.fontSize(12).font('Helvetica-Bold').text('Informations du ticket');
      doc
        .font('Helvetica')
        .text(`Référence : #${(ticket.id || '').slice(0, 8).toUpperCase()}`)
        .text(`Titre : ${ticket.title || 'N/A'}`)
        .text(`Type : ${ticket.type === 'SUR_SITE' ? 'Sur site' : 'À distance'}`)
        .text(`Priorité : ${ticket.priority || 'N/A'}`)
        .text(
          `Date création : ${ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('fr-TN') : 'N/A'}`,
        )
        .text(`Date clôture : ${new Date().toLocaleDateString('fr-TN')}`);

      doc.moveDown();

      // Client
      doc.font('Helvetica-Bold').text('Client');
      doc
        .font('Helvetica')
        .text(`Société : ${client.companyName || 'N/A'}`)
        .text(`Contact : ${client.user?.name || 'N/A'}`)
        .text(`Email : ${client.user?.email || 'N/A'}`);

      doc.moveDown();

      // Technicien
      doc.font('Helvetica-Bold').text('Technicien');
      doc
        .font('Helvetica')
        .text(`Nom : ${tech?.name || 'N/A'}`)
        .text(`Email : ${tech?.email || 'N/A'}`);

      doc.moveDown();

      // Détails intervention
      doc.font('Helvetica-Bold').text("Détails de l'intervention");
      doc.font('Helvetica').text('Description :').text(dto.description, { indent: 20 });

      if (dto.resolution) {
        doc.moveDown(0.5).text('Résolution :').text(dto.resolution, { indent: 20 });
      }

      doc.moveDown();

      // Temps
      doc.font('Helvetica-Bold').text('Temps passé');
      doc
        .font('Helvetica')
        .text(`Heures travaillées : ${dto.hoursWorked}h`)
        .text(`Temps de déplacement : ${dto.travelMinutes} min`);

      doc.moveDown(2);

      // Signatures
      doc.font('Helvetica-Bold').text('Signatures', { align: 'center' });
      doc.moveDown();
      doc.font('Helvetica');
      const sigY = doc.y;
      doc.text('Technicien :', 100, sigY);
      doc.text('Client :', 350, sigY);
      doc.rect(100, sigY + 20, 150, 60).stroke();
      doc.rect(350, sigY + 20, 150, 60).stroke();

      doc.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
  }
}