"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const mailer_service_1 = require("./mailer.service");
const BCRYPT_ROUNDS = 12;
const MAX_LOGIN_FAILURES = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
const DECOY_HASH = bcrypt.hashSync(crypto.randomBytes(32).toString('hex'), BCRYPT_ROUNDS);
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    configService;
    mailer;
    logger = new common_1.Logger(AuthService_1.name);
    requireEmailVerification;
    constructor(prisma, jwtService, configService, mailer) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.mailer = mailer;
        this.requireEmailVerification =
            this.configService.get('REQUIRE_EMAIL_VERIFICATION') !== 'false';
    }
    async register(dto, ctx) {
        const email = dto.email.toLowerCase().trim();
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing) {
            throw new common_1.ConflictException('Unable to register with the provided details');
        }
        const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
        const { token, hash, expires } = this.makeToken(VERIFY_TOKEN_TTL_MS);
        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: dto.name,
                phone: dto.phone,
                emailVerifyTokenHash: hash,
                emailVerifyTokenExpires: expires,
            },
        });
        await this.audit(client_1.AuthEvent.REGISTER, ctx, { userId: user.id, email });
        await this.mailer.sendVerificationEmail(email, token);
        return {
            message: 'Registration successful. Please check your email to verify your account.',
            user: this.publicUser(user),
        };
    }
    async login(dto, ctx) {
        const email = dto.email.toLowerCase().trim();
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (user?.lockedUntil && user.lockedUntil > new Date()) {
            await this.audit(client_1.AuthEvent.LOGIN_LOCKED, ctx, {
                userId: user.id,
                email,
                reason: 'account locked',
            });
            throw new common_1.UnauthorizedException('Account temporarily locked due to too many failed attempts. Try again later.');
        }
        const ok = await bcrypt.compare(dto.password, user?.password ?? DECOY_HASH);
        if (!user || !ok) {
            if (user) {
                await this.recordFailure(user.id);
            }
            await this.audit(client_1.AuthEvent.LOGIN_FAILURE, ctx, {
                userId: user?.id ?? null,
                email,
                reason: !user ? 'unknown email' : 'bad password',
            });
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (this.requireEmailVerification && !user.emailVerified) {
            await this.audit(client_1.AuthEvent.LOGIN_FAILURE, ctx, {
                userId: user.id,
                email,
                reason: 'email not verified',
            });
            throw new common_1.ForbiddenException('Please verify your email before logging in.');
        }
        const refreshed = await this.prisma.user.update({
            where: { id: user.id },
            data: {
                loginFailures: 0,
                lockedUntil: null,
                lastLoginAt: new Date(),
                lastLoginIp: ctx.ip ?? null,
            },
            select: { tokenVersion: true },
        });
        await this.audit(client_1.AuthEvent.LOGIN_SUCCESS, ctx, { userId: user.id, email });
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            ver: refreshed.tokenVersion,
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: this.publicUser(user),
        };
    }
    async revokeSessions(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { tokenVersion: { increment: 1 } },
        });
    }
    async verifyEmail(token, ctx) {
        const hash = this.hashToken(token);
        const user = await this.prisma.user.findUnique({
            where: { emailVerifyTokenHash: hash },
        });
        if (!user ||
            !user.emailVerifyTokenExpires ||
            user.emailVerifyTokenExpires < new Date()) {
            throw new common_1.BadRequestException('Verification link is invalid or has expired.');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                emailVerifyTokenHash: null,
                emailVerifyTokenExpires: null,
            },
        });
        await this.audit(client_1.AuthEvent.EMAIL_VERIFY, ctx, {
            userId: user.id,
            email: user.email,
        });
        return { message: 'Email verified. You may now log in.' };
    }
    async resendVerification(email, ctx) {
        const normalized = email.toLowerCase().trim();
        const user = await this.prisma.user.findUnique({ where: { email: normalized } });
        if (user && !user.emailVerified) {
            const { token, hash, expires } = this.makeToken(VERIFY_TOKEN_TTL_MS);
            await this.prisma.user.update({
                where: { id: user.id },
                data: { emailVerifyTokenHash: hash, emailVerifyTokenExpires: expires },
            });
            await this.mailer.sendVerificationEmail(normalized, token);
        }
        await this.audit(client_1.AuthEvent.PASSWORD_RESET_REQUEST, ctx, {
            userId: user?.id ?? null,
            email: normalized,
            reason: 'resend verification',
        });
        return { message: 'If that account exists, a verification email has been sent.' };
    }
    async forgotPassword(email, ctx) {
        const normalized = email.toLowerCase().trim();
        const user = await this.prisma.user.findUnique({ where: { email: normalized } });
        if (user) {
            const { token, hash, expires } = this.makeToken(RESET_TOKEN_TTL_MS);
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    passwordResetTokenHash: hash,
                    passwordResetTokenExpires: expires,
                },
            });
            await this.mailer.sendPasswordResetEmail(normalized, token);
        }
        await this.audit(client_1.AuthEvent.PASSWORD_RESET_REQUEST, ctx, {
            userId: user?.id ?? null,
            email: normalized,
        });
        return {
            message: 'If an account exists for that email, a password reset link has been sent.',
        };
    }
    async resetPassword(token, newPassword, ctx) {
        const hash = this.hashToken(token);
        const user = await this.prisma.user.findUnique({
            where: { passwordResetTokenHash: hash },
        });
        if (!user ||
            !user.passwordResetTokenExpires ||
            user.passwordResetTokenExpires < new Date()) {
            throw new common_1.BadRequestException('Reset link is invalid or has expired.');
        }
        const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                passwordResetTokenHash: null,
                passwordResetTokenExpires: null,
                loginFailures: 0,
                lockedUntil: null,
                tokenVersion: { increment: 1 },
            },
        });
        await this.audit(client_1.AuthEvent.PASSWORD_RESET_COMPLETE, ctx, {
            userId: user.id,
            email: user.email,
        });
        return { message: 'Password updated. Please log in with your new password.' };
    }
    async recordFailure(userId) {
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: { loginFailures: { increment: 1 } },
            select: { loginFailures: true },
        });
        if (updated.loginFailures >= MAX_LOGIN_FAILURES) {
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    lockedUntil: new Date(Date.now() + LOCKOUT_MS),
                    loginFailures: 0,
                },
            });
        }
    }
    makeToken(ttlMs) {
        const token = crypto.randomBytes(32).toString('hex');
        const hash = this.hashToken(token);
        const expires = new Date(Date.now() + ttlMs);
        return { token, hash, expires };
    }
    hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
    publicUser(user) {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            emailVerified: user.emailVerified,
        };
    }
    async audit(event, ctx, extra = {}) {
        try {
            const data = {
                event,
                userId: extra.userId ?? null,
                email: extra.email ?? null,
                reason: extra.reason ?? null,
                ip: ctx.ip ?? null,
                userAgent: ctx.userAgent?.slice(0, 500) ?? null,
            };
            await this.prisma.authLog.create({ data });
        }
        catch (err) {
            this.logger.error('Failed to write auth log', err);
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        mailer_service_1.MailerService])
], AuthService);
//# sourceMappingURL=auth.service.js.map