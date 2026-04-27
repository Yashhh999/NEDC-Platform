import { ConfigService } from '@nestjs/config';
export declare class MailerService {
    private configService;
    private readonly logger;
    private readonly appUrl;
    private readonly from;
    private readonly mailerEnabled;
    constructor(configService: ConfigService);
    sendVerificationEmail(to: string, token: string): Promise<void>;
    sendPasswordResetEmail(to: string, token: string): Promise<void>;
    private send;
}
