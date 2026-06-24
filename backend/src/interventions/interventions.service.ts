import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UpdateInterventionDto, CloseInterventionDto } from './dto/intervention.dto';
import { Role, TicketStatus } from '@prisma/client';
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
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

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

    const pdfFilename = `intervention-${ticketId}-${Date.now()}.pdf`;
    const pdfPath = path.join(this.uploadsDir, pdfFilename);
    await this.generatePdf(sanitize({ ...intervention }), dto, pdfPath);

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

    const ticket = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { status: TicketStatus.RESOLU },
      include: { client: true },
    });

    if (ticket?.client) {
      await this.prisma.client.update({
        where: { id: ticket.clientId },
        data: { usedHours: { increment: dto.hoursWorked } },
      });
    }

    const techName = intervention.ticket?.technicien?.name ?? 'le technicien';
    const ticketTitle = intervention.ticket?.title ?? 'Ticket';
    const clientUserId = intervention.ticket?.client?.userId;

    const managers = await this.prisma.user.findMany({
      where: { role: Role.MANAGER, isActive: true },
      select: { id: true },
    });
    await Promise.all(
      managers.map((m) =>
        this.notifications.notify(
          m.id,
          'Ticket clôturé',
          `${techName} a clôturé le ticket "${ticketTitle}"`,
          'ticket_closed',
          ticketId,
        ),
      ),
    );

    if (clientUserId) {
      await this.notifications.notify(
        clientUserId,
        'Ticket résolu',
        `Votre ticket "${ticketTitle}" a été résolu et clôturé par ${techName}`,
        'ticket_closed',
        ticketId,
      );
    }

    return updated;
  }

  private generatePdf(
    intervention: any,
    dto: CloseInterventionDto,
    outputPath: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 0, size: 'A4' });
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      const ticket = intervention.ticket || {};
      const client = ticket.client || {};
      const tech = ticket.technicien || null;

      const W = 595;
      const L = 45;
      const CW = W - L * 2;

      const C = {
        navyDark:    '#0f2057',
        navy:        '#1e3a8a',
        blue:        '#2563eb',
        blueLight:   '#dbeafe',
        bluePale:    '#eff6ff',
        green:       '#15803d',
        greenLight:  '#dcfce7',
        greenBorder: '#86efac',
        orange:      '#c2410c',
        orangeLight: '#ffedd5',
        slate:       '#64748b',
        slateLight:  '#f1f5f9',
        slatePale:   '#f8fafc',
        border:      '#e2e8f0',
        dark:        '#1e293b',
        white:       '#ffffff',
        accent:      '#93c5fd',
      };

      const fmt = (d: Date | string) =>
        new Date(d).toLocaleDateString('fr-FR', {
          day: '2-digit', month: '2-digit', year: 'numeric',
        });

      const isUrgent  = ticket.priority === 'URGENT';
      const isOnSite  = ticket.type === 'SUR_SITE';
      const ref       = `REF-${(ticket.id || '--------').slice(0, 8).toUpperCase()}`;
      const closeDate = fmt(new Date());

      // HEADER BANNER
      doc.rect(0, 0, W, 108).fill(C.navyDark);
      doc.rect(0, 105, W, 4).fill(C.blue);
      doc.rect(L, 24, 6, 36).fill(C.blue);
      doc.fillColor(C.white).fontSize(27).font('Helvetica-Bold').text('DataServ', L + 14, 22);
      doc.fillColor(C.accent).fontSize(10).font('Helvetica').text("Fiche d'Intervention Technique", L + 14, 57);
      doc.roundedRect(W - L - 148, 20, 148, 24, 12).fill('#1d4ed8');
      doc.fillColor(C.white).fontSize(9.5).font('Helvetica-Bold').text(ref, W - L - 148, 27, { width: 148, align: 'center' });
      doc.fillColor(C.accent).fontSize(8.5).font('Helvetica').text(`Clôturé le ${closeDate}`, W - L - 148, 52, { width: 148, align: 'right' });

      // TICKET TITLE STRIP
      doc.rect(0, 109, W, 52).fill(C.slateLight);
      doc.roundedRect(L, 122, 65, 18, 9).fill(isUrgent ? C.orangeLight : C.blueLight);
      doc.fillColor(isUrgent ? C.orange : C.blue).fontSize(8).font('Helvetica-Bold')
         .text(isUrgent ? 'URGENT' : 'NORMAL', L, 127, { width: 65, align: 'center' });
      doc.roundedRect(L + 73, 122, 75, 18, 9).fill(C.bluePale);
      doc.fillColor(C.blue).fontSize(8).font('Helvetica-Bold')
         .text(isOnSite ? 'Sur site' : 'A distance', L + 73, 127, { width: 75, align: 'center' });
      doc.fillColor(C.dark).fontSize(13).font('Helvetica-Bold')
         .text((ticket.title || 'Sans titre').slice(0, 62), L + 157, 121, { width: CW - 157 });

      // TWO-COLUMN: TICKET INFO | CLIENT INFO
      let y = 177;
      const c1W = Math.floor(CW * 0.50);
      const c2W = CW - c1W - 8;
      const c2X = L + c1W + 8;
      const rowH = 19;
      const rows = 5;
      const bodyH = rows * rowH + 10;

      doc.rect(L, y, c1W, 22).fill(C.navy);
      doc.fillColor(C.white).fontSize(7.5).font('Helvetica-Bold').text('INFORMATIONS DU TICKET', L + 10, y + 7);
      doc.rect(L, y + 22, c1W, bodyH).fillAndStroke(C.white, C.border);

      const ticketRows: [string, string][] = [
        ['Référence',     `#${(ticket.id || '').slice(0, 8).toUpperCase()}`],
        ['Type',          isOnSite ? 'Sur site' : 'À distance'],
        ['Priorité',      ticket.priority || 'N/A'],
        ['Date création', ticket.createdAt ? fmt(ticket.createdAt) : 'N/A'],
        ['Date clôture',  closeDate],
      ];

      ticketRows.forEach(([label, value], i) => {
        const ry = y + 28 + i * rowH;
        if (i % 2 === 1) doc.rect(L + 1, ry - 2, c1W - 2, rowH).fill(C.slatePale);
        doc.fillColor(C.slate).fontSize(8).font('Helvetica').text(label, L + 10, ry, { width: c1W * 0.45 });
        doc.fillColor(C.dark).fontSize(8).font('Helvetica-Bold').text(value, L + c1W * 0.48, ry, { width: c1W * 0.48 });
      });

      doc.rect(c2X, y, c2W, 22).fill(C.navy);
      doc.fillColor(C.white).fontSize(7.5).font('Helvetica-Bold').text('CLIENT', c2X + 10, y + 7);
      doc.rect(c2X, y + 22, c2W, bodyH).fillAndStroke(C.white, C.border);

      const clientRows: [string, string][] = [
        ['Société',   client.companyName || 'N/A'],
        ['Contact',   client.user?.name  || 'N/A'],
        ['Email',     client.user?.email || 'N/A'],
        ['Téléphone', client.user?.phone || 'N/A'],
        ['Contrat',   client.isContractual ? 'Contractuel' : 'Hors contrat'],
      ];

      clientRows.forEach(([label, value], i) => {
        const ry = y + 28 + i * rowH;
        if (i % 2 === 1) doc.rect(c2X + 1, ry - 2, c2W - 2, rowH).fill(C.slatePale);
        doc.fillColor(C.slate).fontSize(8).font('Helvetica').text(label, c2X + 10, ry, { width: c2W * 0.42 });
        doc.fillColor(C.dark).fontSize(8).font('Helvetica-Bold').text((value).slice(0, 26), c2X + c2W * 0.45, ry, { width: c2W * 0.5 });
      });

      // TECHNICIAN ROW
      y += 22 + bodyH + 12;
      doc.rect(L, y, CW, 22).fill(C.navy);
      doc.fillColor(C.white).fontSize(7.5).font('Helvetica-Bold').text('TECHNICIEN ASSIGNÉ', L + 10, y + 7);

      const techBodyH = 44;
      doc.rect(L, y + 22, CW, techBodyH).fillAndStroke(C.white, C.border);

      const tcW = Math.floor(CW / 3);
      const techCols = [
        { label: 'Nom',       value: tech?.name  || 'N/A' },
        { label: 'Email',     value: tech?.email || 'N/A' },
        { label: 'Téléphone', value: tech?.phone || 'N/A' },
      ];
      techCols.forEach(({ label, value }, i) => {
        const tx = L + tcW * i + 14;
        if (i > 0) {
          doc.moveTo(L + tcW * i, y + 26).lineTo(L + tcW * i, y + 22 + techBodyH - 4)
             .strokeColor(C.border).stroke();
        }
        doc.fillColor(C.slate).fontSize(7.5).font('Helvetica').text(label, tx, y + 29);
        doc.fillColor(C.dark).fontSize(9.5).font('Helvetica-Bold').text(value.slice(0, 32), tx, y + 42, { width: tcW - 28 });
      });

      // DESCRIPTION
      y += 22 + techBodyH + 12;
      doc.rect(L, y, CW, 22).fill(C.blue);
      doc.fillColor(C.white).fontSize(7.5).font('Helvetica-Bold').text("DESCRIPTION DE L'INTERVENTION", L + 10, y + 7);

      const descText = dto.description || 'Aucune description fournie.';
      const descH = Math.max(52, doc.heightOfString(descText, { width: CW - 24, lineGap: 3 }) + 22);
      doc.rect(L, y + 22, CW, descH).fill(C.slatePale).stroke(C.border);
      doc.fillColor(C.dark).fontSize(9.5).font('Helvetica').text(descText, L + 14, y + 32, { width: CW - 28, lineGap: 3 });
      y += 22 + descH;

      // RESOLUTION
      if (dto.resolution) {
        y += 10;
        doc.rect(L, y, CW, 22).fill(C.green);
        doc.fillColor(C.white).fontSize(7.5).font('Helvetica-Bold').text('RÉSOLUTION', L + 10, y + 7);

        const resText = dto.resolution;
        const resH = Math.max(52, doc.heightOfString(resText, { width: CW - 24, lineGap: 3 }) + 22);
        doc.rect(L, y + 22, CW, resH).fill(C.greenLight).stroke(C.greenBorder);
        doc.fillColor('#14532d').fontSize(9.5).font('Helvetica').text(resText, L + 14, y + 32, { width: CW - 28, lineGap: 3 });
        y += 22 + resH;
      }

      // KPI CARDS
      y += 14;
      if (y + 210 > 808) { doc.addPage(); y = 40; }

      const kpiW = Math.floor(CW / 3);
      const kpiH = 68;
      const kpis = [
        { value: `${dto.hoursWorked}h`,             label: 'Heures travaillées', bg: C.blueLight,  fg: C.navy, br: C.blue },
        { value: `${dto.travelMinutes} min`,         label: 'Temps déplacement',  bg: C.slateLight, fg: C.dark, br: C.border },
        { value: isOnSite ? 'Sur site' : 'Distance', label: "Type d'intervention", bg: C.slatePale, fg: C.dark, br: C.border },
      ];

      kpis.forEach(({ value, label, bg, fg, br }, i) => {
        const kx = L + kpiW * i + (i > 0 ? 4 : 0);
        const kw = kpiW - (i < 2 ? 4 : 0);
        doc.rect(kx, y, kw, kpiH).fillAndStroke(bg, br);
        doc.fillColor(fg).fontSize(i === 2 ? 13 : 22).font('Helvetica-Bold')
           .text(value, kx, y + (i === 2 ? 18 : 10), { width: kw, align: 'center' });
        doc.fillColor(C.slate).fontSize(8).font('Helvetica').text(label, kx, y + 48, { width: kw, align: 'center' });
      });

      // SIGNATURES
      y += kpiH + 22;
      if (y + 120 > 808) { doc.addPage(); y = 40; }

      const lblW = 90;
      const ruleW = (CW - lblW) / 2;
      doc.moveTo(L, y + 7).lineTo(L + ruleW, y + 7).strokeColor(C.border).stroke();
      doc.moveTo(L + ruleW + lblW, y + 7).lineTo(L + CW, y + 7).strokeColor(C.border).stroke();
      doc.fillColor(C.slate).fontSize(8).font('Helvetica-Bold').text('SIGNATURES', L + ruleW, y, { width: lblW, align: 'center' });

      y += 20;
      const sigW = Math.floor(CW / 2) - 8;

      doc.roundedRect(L, y, sigW, 82, 4).fillAndStroke(C.slatePale, C.border);
      doc.fillColor(C.slate).fontSize(8).font('Helvetica').text('Signature du technicien', L, y + 9, { width: sigW, align: 'center' });
      doc.moveTo(L + 18, y + 60).lineTo(L + sigW - 18, y + 60).dash(3, { space: 4 }).strokeColor(C.border).stroke();
      doc.undash();
      doc.fillColor(C.dark).fontSize(8.5).font('Helvetica-Bold').text(tech?.name || '', L, y + 67, { width: sigW, align: 'center' });

      const s2X = L + sigW + 16;
      doc.roundedRect(s2X, y, sigW, 82, 4).fillAndStroke(C.slatePale, C.border);
      doc.fillColor(C.slate).fontSize(8).font('Helvetica').text('Signature du client / représentant', s2X, y + 9, { width: sigW, align: 'center' });
      doc.moveTo(s2X + 18, y + 60).lineTo(s2X + sigW - 18, y + 60).dash(3, { space: 4 }).strokeColor(C.border).stroke();
      doc.undash();
      doc.fillColor(C.dark).fontSize(8.5).font('Helvetica-Bold').text(client.user?.name || '', s2X, y + 67, { width: sigW, align: 'center' });

      // FOOTER
      doc.rect(0, 808, W, 34).fill(C.navyDark);
      doc.rect(0, 808, W, 2).fill(C.blue);
      doc.fillColor(C.accent).fontSize(7.5).font('Helvetica')
         .text('DataServ  —  Service Technique & Support Informatique  |  25 Av. Kh., Tunis 1073', L, 817, { width: CW * 0.65 });
      doc.fillColor(C.white).fontSize(7.5).font('Helvetica-Bold')
         .text(`Généré le ${closeDate}  |  ${ref}`, L + CW * 0.65, 817, { width: CW * 0.35, align: 'right' });

      doc.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
  }
}
