import { Injectable, Logger } from '@nestjs/common';
import { ContactRequestDto } from './dto/contact-request.dto';
import * as nodemailer from 'nodemailer';
import { MailContent } from '../common/services/smtp.service';
// NOTE: Removed SmtpService dependency to honor requirement of no DB storage/config.

@Injectable()
export class NodeMailService {
  private readonly logger = new Logger(NodeMailService.name);

  // No constructor args; we rely purely on environment or ethereal fallback.
  constructor() {}

  async submit(dto: ContactRequestDto) {
    console.log('[NodeMail] submit() called with payload:', dto);

    const hrEnv = process.env.CONTACT_EMAIL || '';
    const to = hrEnv.split(',').map(e => e.trim()).filter(Boolean);
    console.log('[NodeMail] resolved recipients:', to);

    if (!to.length) {
      console.error('[NodeMail] No recipients configured (CONTACT_EMAIL env empty).');
      return { success: false, error: 'NO_RECIPIENTS' };
    }

    const subject = `Website Contact: ${dto.name}`;
    const text = [
      `Name: ${dto.name}`,
      `Email: ${dto.email}`,
      `Mobile: ${dto.mobile}`,
      dto.source ? `Source: ${dto.source}` : undefined,
      '---',
      dto.message,
    ].filter(Boolean).join('\n');
    console.log('[NodeMail] constructed email text length:', text.length);

    const mailContent = new MailContent(to, subject, text);
    let info: any = null;

    // Try direct ENV SMTP first (primary path now)
  const host = process.env.MAIL_HOST;
  const port = process.env.MAIL_PORT ? parseInt(process.env.MAIL_PORT, 10) : undefined;
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASSWORD;
  const fromName = process.env.MAIL_FROM_NAME || 'Website Contact';

  console.log('[NodeMail] ENV SMTP presence check:', { hasHost: !!host, hasPort: !!port, hasUser: !!user, hasPass: !!pass });

    if (host && port && user && pass) {
      try {
        console.log('[NodeMail] attempting ENV SMTP transport creation...');
        const transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
        });
        if (process.env.NODE_ENV !== 'test') {
          await transporter.verify().catch(err => this.logger.warn(`SMTP verify skipped: ${err.message}`));
        }
        console.log('[NodeMail] building HTML template...');
        const html = this.buildHtmlTemplate(dto, {
          brand: process.env.MAIL_BRAND_NAME || fromName,
          brandUrl: process.env.MAIL_BRAND_URL || '',
          address: process.env.MAIL_BRAND_ADDRESS || '',
          supportEmail: process.env.MAIL_BRAND_SUPPORT || user,
        });
        console.log('[NodeMail] sending email via ENV SMTP...');
        info = await transporter.sendMail({
          from: { name: fromName, address: user },
          to: mailContent.to,
          subject: mailContent.subject,
          text: mailContent.text,
          html,
          headers: {
            'Reply-To': dto.email,
            'X-Contact-Source': dto.source || 'website-contact',
          },
        });
        console.log('[NodeMail] ENV SMTP send result messageId:', info && info.messageId);
      } catch (envErr) {
        this.logger.error(`ENV SMTP send failed: ${(envErr as any).message}`);
        console.error('[NodeMail] ENV SMTP error object:', envErr);
      }
    }

 
    if (info instanceof Error) {
      this.logger.error(`Failed to send contact email: ${info.message}`);
      return { success: false, error: 'SEND_FAILED' };
    }
    console.log('[NodeMail] final success returning messageId:', info ? (info as any).messageId : null);
    return { success: true, id: (info as any)?.messageId || null };
  }

  private escape(value: string) {
    return (value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private buildHtmlTemplate(dto: ContactRequestDto, meta: { brand: string; brandUrl: string; address: string; supportEmail: string; }) {
    const year = new Date().getFullYear();
    const escapedMessage = this.escape(dto.message).replace(/\n/g, '<br/>');
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Contact Message</title>
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
</head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:32px auto 48px;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
    <div style="padding:24px 28px 8px;">
      <h2 style="margin:0 0 12px;font-size:20px;font-weight:600;color:#1a202c;">New Website Contact</h2>
      <p style="margin:0 0 16px;font-size:14px;color:#4a5568;">You received a new inquiry from your contact form.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="font-size:14px;line-height:20px;margin:0 0 16px;">
        <tr><td style="font-weight:600;width:120px;padding:4px 0;color:#2d3748;">Name:</td><td style="padding:4px 0;color:#2d3748;">${this.escape(dto.name)}</td></tr>
        <tr><td style="font-weight:600;width:120px;padding:4px 0;color:#2d3748;">Email:</td><td style="padding:4px 0;">${this.escape(dto.email)}</td></tr>
        <tr><td style="font-weight:600;width:120px;padding:4px 0;color:#2d3748;">Mobile:</td><td style="padding:4px 0;">${this.escape(dto.mobile)}</td></tr>
        <tr><td style="font-weight:600;width:120px;padding:4px 0;color:#2d3748;">Received:</td><td style="padding:4px 0;">${new Date().toLocaleString()}</td></tr>
      </table>
      <div style="background:#f7fafc;border:1px solid #edf2f7;border-radius:6px;padding:16px;font-size:14px;color:#2d3748;line-height:20px;white-space:normal;">
        ${escapedMessage}
      </div>
      <p style="margin:18px 0 0;font-size:12px;color:#718096;">Reply directly to this email to respond to the sender.</p>
    </div>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:0" />
   
  </div>
</body>
</html>`;
  }
}
