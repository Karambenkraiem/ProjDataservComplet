// import { Injectable } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';
// import * as ExcelJS from 'exceljs';

// @Injectable()
// export class RapportsService {
//   constructor(private prisma: PrismaService) {}

//   async exportInterventionsExcel(from?: string, to?: string, clientId?: string): Promise<Buffer> {
//     const where: any = {};
//     if (from || to) {
//       where.createdAt = {};
//       if (from) where.createdAt.gte = new Date(from);
//       if (to) where.createdAt.lte = new Date(to);
//     }
//     if (clientId) where.clientId = clientId;

//     const tickets = await this.prisma.ticket.findMany({
//       where,
//       include: {
//         client: { include: { user: { omit: { password: true } } } },
//         technicien: { omit: { password: true } },
//         intervention: true,
//       },
//       orderBy: { createdAt: 'desc' },
//     });

//     const workbook = new ExcelJS.Workbook();
//     workbook.creator = 'DataServ';
//     workbook.created = new Date();

//     const sheet = workbook.addWorksheet('Interventions', {
//       pageSetup: { paperSize: 9, orientation: 'landscape' },
//     });

//     // Style en-tête
//     const headerStyle: Partial<ExcelJS.Style> = {
//       font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 },
//       fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } },
//       alignment: { horizontal: 'center', vertical: 'middle' },
//       border: {
//         top: { style: 'thin' }, bottom: { style: 'thin' },
//         left: { style: 'thin' }, right: { style: 'thin' },
//       },
//     };

//     sheet.columns = [
//       { header: 'Réf.', key: 'ref', width: 12 },
//       { header: 'Date création', key: 'date', width: 16 },
//       { header: 'Client', key: 'client', width: 22 },
//       { header: 'Titre', key: 'title', width: 30 },
//       { header: 'Type', key: 'type', width: 12 },
//       { header: 'Priorité', key: 'priority', width: 12 },
//       { header: 'Statut', key: 'status', width: 14 },
//       { header: 'Technicien', key: 'tech', width: 20 },
//       { header: 'Heures travaillées', key: 'hours', width: 18 },
//       { header: 'Déplacement (min)', key: 'travel', width: 18 },
//       { header: 'Date clôture', key: 'closed', width: 16 },
//     ];

//     // Appliquer style header
//     sheet.getRow(1).eachCell(cell => Object.assign(cell, headerStyle));
//     sheet.getRow(1).height = 30;

//     // Remplir les données
//     tickets.forEach((t, i) => {
//       const row = sheet.addRow({
//         ref: `#${t.id.slice(0, 8).toUpperCase()}`,
//         date: new Date(t.createdAt).toLocaleDateString('fr-TN'),
//         client: (t.client as any).companyName,
//         title: t.title,
//         type: t.type === 'SUR_SITE' ? 'Sur site' : 'À distance',
//         priority: t.priority,
//         status: t.status.replace('_', ' '),
//         tech: (t.technicien as any)?.name ?? '—',
//         hours: (t.intervention as any)?.hoursWorked ?? 0,
//         travel: (t.intervention as any)?.travelMinutes ?? 0,
//         closed: (t.intervention as any)?.closedAt
//           ? new Date((t.intervention as any).closedAt).toLocaleDateString('fr-TN')
//           : '—',
//       });

//       // Alternance de couleurs
//       if (i % 2 === 0) {
//         row.eachCell(cell => {
//           cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F4FF' } };
//         });
//       }

//       // Couleur priorité
//       const priorityCell = row.getCell('priority');
//       if (t.priority === 'URGENT') {
//         priorityCell.font = { bold: true, color: { argb: 'FFDC2626' } };
//       }
//     });

//     // Totaux
//     sheet.addRow({});
//     const totalRow = sheet.addRow({
//       ref: 'TOTAL',
//       hours: tickets.reduce((s, t) => s + ((t.intervention as any)?.hoursWorked ?? 0), 0),
//       travel: tickets.reduce((s, t) => s + ((t.intervention as any)?.travelMinutes ?? 0), 0),
//     });
//     totalRow.font = { bold: true };

//     const buf = await workbook.xlsx.writeBuffer();
//     return Buffer.from(buf);
//   }

//   async rapportMensuelClient(clientId: string, month: number, year: number): Promise<Buffer> {
//     const start = new Date(year, month - 1, 1);
//     const end = new Date(year, month, 0, 23, 59, 59);

//     const client = await this.prisma.client.findUniqueOrThrow({
//       where: { id: clientId },
//       include: { user: { omit: { password: true } } },
//     });

//     const tickets = await this.prisma.ticket.findMany({
//       where: { clientId, createdAt: { gte: start, lte: end } },
//       include: {
//         technicien: { omit: { password: true } },
//         intervention: true,
//       },
//     });

//     const totalHours = tickets.reduce((s, t) => s + ((t.intervention as any)?.hoursWorked ?? 0), 0);
//     const totalTravel = tickets.reduce((s, t) => s + ((t.intervention as any)?.travelMinutes ?? 0), 0);

//     const workbook = new ExcelJS.Workbook();
//     const sheet = workbook.addWorksheet('Rapport mensuel');

//     // Titre
//     sheet.mergeCells('A1:G1');
//     const titleCell = sheet.getCell('A1');
//     titleCell.value = `Rapport mensuel — ${(client as any).companyName} — ${start.toLocaleDateString('fr-TN', { month: 'long', year: 'numeric' })}`;
//     titleCell.font = { bold: true, size: 14 };
//     titleCell.alignment = { horizontal: 'center' };
//     sheet.getRow(1).height = 35;

//     // Infos client
//     sheet.addRow([]);
//     sheet.addRow(['Client:', (client as any).companyName]);
//     sheet.addRow(['Contact:', (client as any).user.name]);
//     sheet.addRow(['Heures contrat:', client.contractHours ? `${client.contractHours}h` : 'Hors contrat']);
//     sheet.addRow(['Heures consommées (période):', `${totalHours}h`]);
//     sheet.addRow(['Déplacement total:', `${totalTravel} min`]);
//     sheet.addRow([]);

//     // Tableau interventions
//     const headerRow = sheet.addRow(['Date', 'Titre', 'Type', 'Statut', 'Technicien', 'Heures', 'Déplacement']);
//     headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
//     headerRow.eachCell(cell => {
//       cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
//       cell.alignment = { horizontal: 'center' };
//     });
//     sheet.getRow(headerRow.number).height = 25;

//     tickets.forEach(t => {
//       sheet.addRow([
//         new Date(t.createdAt).toLocaleDateString('fr-TN'),
//         t.title,
//         t.type === 'SUR_SITE' ? 'Sur site' : 'À distance',
//         t.status,
//         (t.technicien as any)?.name ?? '—',
//         (t.intervention as any)?.hoursWorked ?? 0,
//         (t.intervention as any)?.travelMinutes ?? 0,
//       ]);
//     });

//     sheet.columns.forEach(col => { col.width = 20; });

//     const buf = await workbook.xlsx.writeBuffer();
//     return Buffer.from(buf);
//   }
// }

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as ExcelJS from 'exceljs';

@Injectable()
export class RapportsService {
  constructor(private prisma: PrismaService) {}

  async exportInterventionsExcel(from?: string, to?: string, clientId?: string): Promise<Buffer> {
    const where: any = {};

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    if (clientId) where.clientId = clientId;

    const tickets = await this.prisma.ticket.findMany({
      where,
      include: {
        client: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
        technicien: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        intervention: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'DataServ';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Interventions', {
      pageSetup: { paperSize: 9, orientation: 'landscape' },
    });

    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
    };

    sheet.columns = [
      { header: 'Réf.', key: 'ref', width: 12 },
      { header: 'Date création', key: 'date', width: 16 },
      { header: 'Client', key: 'client', width: 22 },
      { header: 'Titre', key: 'title', width: 30 },
      { header: 'Type', key: 'type', width: 12 },
      { header: 'Priorité', key: 'priority', width: 12 },
      { header: 'Statut', key: 'status', width: 14 },
      { header: 'Technicien', key: 'tech', width: 20 },
      { header: 'Heures travaillées', key: 'hours', width: 18 },
      { header: 'Déplacement (min)', key: 'travel', width: 18 },
      { header: 'Date clôture', key: 'closed', width: 16 },
    ];

    sheet.getRow(1).eachCell((cell) => Object.assign(cell, headerStyle));
    sheet.getRow(1).height = 30;

    tickets.forEach((t, i) => {
      const row = sheet.addRow({
        ref: `#${t.id.slice(0, 8).toUpperCase()}`,
        date: new Date(t.createdAt).toLocaleDateString('fr-TN'),
        client: (t.client as any).companyName,
        title: t.title,
        type: t.type === 'SUR_SITE' ? 'Sur site' : 'À distance',
        priority: t.priority,
        status: t.status.replace('_', ' '),
        tech: (t.technicien as any)?.name ?? '—',
        hours: (t.intervention as any)?.hoursWorked ?? 0,
        travel: (t.intervention as any)?.travelMinutes ?? 0,
        closed: (t.intervention as any)?.closedAt
          ? new Date((t.intervention as any).closedAt).toLocaleDateString('fr-TN')
          : '—',
      });

      if (i % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF0F4FF' },
          };
        });
      }

      const priorityCell = row.getCell('priority');
      if (t.priority === 'URGENT') {
        priorityCell.font = { bold: true, color: { argb: 'FFDC2626' } };
      }
    });

    sheet.addRow({});

    const totalRow = sheet.addRow({
      ref: 'TOTAL',
      hours: tickets.reduce(
        (s, t) => s + ((t.intervention as any)?.hoursWorked ?? 0),
        0,
      ),
      travel: tickets.reduce(
        (s, t) => s + ((t.intervention as any)?.travelMinutes ?? 0),
        0,
      ),
    });

    totalRow.font = { bold: true };

    const buf = await workbook.xlsx.writeBuffer();
    return Buffer.from(buf);
  }

  async rapportMensuelClient(
    clientId: string,
    month: number,
    year: number,
  ): Promise<Buffer> {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const client = await this.prisma.client.findUniqueOrThrow({
      where: { id: clientId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    const tickets = await this.prisma.ticket.findMany({
      where: {
        clientId,
        createdAt: { gte: start, lte: end },
      },
      include: {
        technicien: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        intervention: true,
      },
    });

    const totalHours = tickets.reduce(
      (s, t) => s + ((t.intervention as any)?.hoursWorked ?? 0),
      0,
    );

    const totalTravel = tickets.reduce(
      (s, t) => s + ((t.intervention as any)?.travelMinutes ?? 0),
      0,
    );

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Rapport mensuel');

    sheet.mergeCells('A1:G1');

    const titleCell = sheet.getCell('A1');
    titleCell.value = `Rapport mensuel — ${(client as any).companyName} — ${start.toLocaleDateString(
      'fr-TN',
      { month: 'long', year: 'numeric' },
    )}`;

    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { horizontal: 'center' };

    sheet.getRow(1).height = 35;

    sheet.addRow([]);
    sheet.addRow(['Client:', (client as any).companyName]);
    sheet.addRow(['Contact:', (client as any).user.name]);
    sheet.addRow([
      'Heures contrat:',
      client.contractHours ? `${client.contractHours}h` : 'Hors contrat',
    ]);
    sheet.addRow(['Heures consommées (période):', `${totalHours}h`]);
    sheet.addRow(['Déplacement total:', `${totalTravel} min`]);
    sheet.addRow([]);

    const headerRow = sheet.addRow([
      'Date',
      'Titre',
      'Type',
      'Statut',
      'Technicien',
      'Heures',
      'Déplacement',
    ]);

    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E40AF' },
      };
      cell.alignment = { horizontal: 'center' };
    });

    sheet.getRow(headerRow.number).height = 25;

    tickets.forEach((t) => {
      sheet.addRow([
        new Date(t.createdAt).toLocaleDateString('fr-TN'),
        t.title,
        t.type === 'SUR_SITE' ? 'Sur site' : 'À distance',
        t.status,
        (t.technicien as any)?.name ?? '—',
        (t.intervention as any)?.hoursWorked ?? 0,
        (t.intervention as any)?.travelMinutes ?? 0,
      ]);
    });

    sheet.columns.forEach((col) => {
      col.width = 20;
    });

    const buf = await workbook.xlsx.writeBuffer();
    return Buffer.from(buf);
  }
}
