import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MailerService } from './mailer.service';
export interface AuthContext {
    ip?: string;
    userAgent?: string;
}
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    private mailer;
    private readonly logger;
    private readonly requireEmailVerification;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, mailer: MailerService);
    register(dto: RegisterDto, ctx: AuthContext): Promise<{
        message: string;
        user: {
            id: string;
            name: string | null;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            emailVerified: boolean;
        };
    }>;
    login(dto: LoginDto, ctx: AuthContext): Promise<{
        access_token: string;
        user: {
            id: string;
            name: string | null;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            emailVerified: boolean;
        };
    }>;
    verifyEmail(token: string, ctx: AuthContext): Promise<{
        message: string;
    }>;
    resendVerification(email: string, ctx: AuthContext): Promise<{
        message: string;
    }>;
    forgotPassword(email: string, ctx: AuthContext): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string, ctx: AuthContext): Promise<{
        message: string;
    }>;
    private recordFailure;
    private makeToken;
    private hashToken;
    private publicUser;
    private audit;
}
