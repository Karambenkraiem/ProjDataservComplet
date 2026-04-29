import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST', 'smtp.gmail.com'),
      port: this.config.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASS'),
      },
    });
  }

  async sendInterventionReport(to: string, clientName: string, pdfPath: string, ticketTitle: string) {
    try {
      await this.transporter.sendMail({
        from: `"DataServ" <${this.config.get('SMTP_USER')}>`,
        to,
        subject: `Fiche d'intervention — ${ticketTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1e40af; color: white; padding: 24px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">DataServ</h1>
              <p style="margin: 4px 0 0;">Rapport d'intervention technique</p>
            </div>
            <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0;">
              <p>Bonjour <strong>${clientName}</strong>,</p>
              <p>Veuillez trouver ci-joint la fiche d'intervention pour le ticket : <strong>${ticketTitle}</strong>.</p>
              <p>Merci de votre confiance.</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
              <p style="color: #64748b; font-size: 14px;">
                DataServ — Service Technique<br>
                25 Av. Kh., Tunis 1073
              </p>
            </div>
          </div>
        `,
        attachments: pdfPath ? [{ filename: `fiche-intervention.pdf`, path: pdfPath }] : [],
      });
      this.logger.log(`Email envoyé à ${to}`);
    } catch (err) {
      this.logger.error(`Erreur envoi email: ${err.message}`);
    }
  }

  async sendTicketCreated(techEmail: string, techName: string, ticketTitle: string, priority: string) {
    try {
      await this.transporter.sendMail({
        from: `"DataServ" <${this.config.get('SMTP_USER')}>`,
        to: techEmail,
        subject: `[${priority === 'URGENT' ? '🔴 URGENT' : '📋 Nouveau'}] Ticket assigné: ${ticketTitle}`,
        html: `
          <p>Bonjour ${techName},</p>
          <p>Un nouveau ticket vous a été assigné :</p>
          <p><strong>${ticketTitle}</strong> — Priorité: ${priority}</p>
          <p>Connectez-vous à DataServ pour consulter les détails.</p>
        `,
      });
    } catch (err) {
      this.logger.error(`Erreur notification ticket: ${err.message}`);
    }
  }
}