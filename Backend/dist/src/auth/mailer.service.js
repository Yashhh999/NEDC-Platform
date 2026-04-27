"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MailerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let MailerService = MailerService_1 = class MailerService {
    configService;
    logger = new common_1.Logger(MailerService_1.name);
    appUrl;
    from;
    mailerEnabled;
    constructor(configService) {
        this.configService = configService;
        this.appUrl =
            this.configService.get('APP_URL') ?? 'http://localhost:3000';
        this.from =
            this.configService.get('MAIL_FROM') ?? 'no-reply@example.com';
        this.mailerEnabled =
            this.configService.get('MAILER_PROVIDER') !== undefined;
    }
    async sendVerificationEmail(to, token) {
        const link = `${this.appUrl}/verify-email?token=${encodeURIComponent(token)}`;
        const subject = 'Verify your email address';
        const html = `<p>Welcome to NEDC.</p>
      <p>Click the link below to verify your email:</p>
      <p><a href="${link}">${link}</a></p>
      <p>The link expires in 24 hours.</p>`;
        await this.send(to, subject, html, 'verification');
    }
    async sendPasswordResetEmail(to, token) {
        const link = `${this.appUrl}/reset-password?token=${encodeURIComponent(token)}`;
        const subject = 'Reset your password';
        const html = `<p>You requested a password reset.</p>
      <p>Click the link below to choose a new password:</p>
      <p><a href="${link}">${link}</a></p>
      <p>The link expires in 1 hour. If you didn't request this, ignore this email.</p>`;
        await this.send(to, subject, html, 'password-reset');
    }
    async send(to, subject, html, kind) {
        if (!this.mailerEnabled) {
            this.logger.warn(`[MAILER NOT WIRED] kind=${kind} to=${to} subject="${subject}". ` +
                `Wire a provider in mailer.service.ts.`);
            if (process.env.EMAIL_TOKEN_DEBUG === 'true') {
                this.logger.warn(`[DEV] Email body:\n${html}`);
            }
            return;
        }
        this.logger.error(`MAILER_PROVIDER=${process.env.MAILER_PROVIDER} is set but no provider is implemented in mailer.service.ts. Email NOT sent.`);
    }
};
exports.MailerService = MailerService;
exports.MailerService = MailerService = MailerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailerService);
//# sourceMappingURL=mailer.service.js.map