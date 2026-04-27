import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Pluggable mailer.
//
// In dev / when no mailer is wired, links and tokens are written to the
// server log so the flow can be tested without a third-party provider.
//
// To wire a real provider (Resend / Postmark / SES):
//  1. Implement `send(to, subject, html)` against your SDK below.
//  2. Set MAIL_FROM and provider creds in env.
//  3. The auth service already calls these methods — no further changes
//     are required.
//
// IMPORTANT: never return verification or reset tokens in HTTP responses.
// They must travel only over the email channel in production.

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly appUrl: string;
  private readonly from: string;
  private readonly mailerEnabled: boolean;

  constructor(private configService: ConfigService) {
    this.appUrl =
      this.configService.get<string>('APP_URL') ?? 'http://localhost:3000';
    this.from =
      this.configService.get<string>('MAIL_FROM') ?? 'no-reply@example.com';
    this.mailerEnabled =
      this.configService.get<string>('MAILER_PROVIDER') !== undefined;
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const link = `${this.appUrl}/verify-email?token=${encodeURIComponent(token)}`;
    const subject = 'Verify your email address';
    const html = `<p>Welcome to NEDC.</p>
      <p>Click the link below to verify your email:</p>
      <p><a href="${link}">${link}</a></p>
      <p>The link expires in 24 hours.</p>`;
    await this.send(to, subject, html, 'verification');
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const link = `${this.appUrl}/reset-password?token=${encodeURIComponent(token)}`;
    const subject = 'Reset your password';
    const html = `<p>You requested a password reset.</p>
      <p>Click the link below to choose a new password:</p>
      <p><a href="${link}">${link}</a></p>
      <p>The link expires in 1 hour. If you didn't request this, ignore this email.</p>`;
    await this.send(to, subject, html, 'password-reset');
  }

  private async send(
    to: string,
    subject: string,
    html: string,
    kind: string,
  ): Promise<void> {
    if (!this.mailerEnabled) {
      this.logger.warn(
        `[MAILER NOT WIRED] kind=${kind} to=${to} subject="${subject}". ` +
          `Wire a provider in mailer.service.ts.`,
      );
      if (process.env.EMAIL_TOKEN_DEBUG === 'true') {
        this.logger.warn(`[DEV] Email body:\n${html}`);
      }
      return;
    }

    // Replace this branch with your provider's SDK call. Example skeletons:
    //
    // Resend:
    //   const resend = new Resend(process.env.RESEND_API_KEY!);
    //   await resend.emails.send({ from: this.from, to, subject, html });
    //
    // Postmark:
    //   await client.sendEmail({ From: this.from, To: to, Subject: subject, HtmlBody: html });
    //
    // AWS SES:
    //   await ses.sendEmail({ Source: this.from, Destination: { ToAddresses: [to] }, ... }).promise();
    //
    // Until one of the above is implemented, MAILER_PROVIDER must remain
    // unset so the no-op branch above is taken.
    this.logger.error(
      `MAILER_PROVIDER=${process.env.MAILER_PROVIDER} is set but no provider is implemented in mailer.service.ts. Email NOT sent.`,
    );
  }
}
