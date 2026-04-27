import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto, req: Request): Promise<{
        message: string;
        user: {
            id: string;
            name: string | null;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            emailVerified: boolean;
        };
    }>;
    login(dto: LoginDto, req: Request, res: Response): Promise<{
        access_token: string;
        user: {
            id: string;
            name: string | null;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            emailVerified: boolean;
        };
    }>;
    logout(res: Response): {
        message: string;
    };
    getMe(user: {
        id: string;
        email: string;
        role: string;
    }): {
        user: {
            id: string;
            email: string;
            role: string;
        };
    };
    verifyEmail(dto: VerifyEmailDto, req: Request): Promise<{
        message: string;
    }>;
    resendVerification(dto: ForgotPasswordDto, req: Request): Promise<{
        message: string;
    }>;
    forgot(dto: ForgotPasswordDto, req: Request): Promise<{
        message: string;
    }>;
    reset(dto: ResetPasswordDto, req: Request): Promise<{
        message: string;
    }>;
}
